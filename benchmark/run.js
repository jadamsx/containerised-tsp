const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { performance } = require("perf_hooks");
const { NearestNeighborTSP } = require("../shared/algorithms/nearest-neighbour-algorithm");
const { CheapestInsertionTSP } = require("../shared/algorithms/cheapest-insertion-algorithm");
const { DynamicProgrammingTSP } = require("../shared/algorithms/dynamic-programming-algorithm");
const { BruteForceTSP } = require("../shared/algorithms/brute-force-algorithm");
const { ThreeOptTSP } = require("../shared/algorithms/three-opt-algorithm");

const repeats = 3;
const workerCounts = [1, 2, 4, 8];
const pollInterval = 100;
const workerWaitTimeout = 2 * 60 * 1000;

const graphsDir = path.join(__dirname, "../frontend/web-app/graphs");
const resultsDir = path.join(__dirname, "results");
const composeArgs = [
  "compose",
  "-f",
  path.join(__dirname, "../docker-compose.yml"),
  "-f",
  path.join(__dirname, "docker-compose.ports.yml"),
];

const singles = [
  {
    name: "nearest-neighbour",
    Algorithm: NearestNeighborTSP,
    url: "http://localhost:3000",
    cities: [10, 12, 16],
  },
  {
    name: "cheapest-insertion",
    Algorithm: CheapestInsertionTSP,
    url: "http://localhost:3010",
    cities: [10, 12, 16],
  },
  {
    name: "dynamic-programming",
    Algorithm: DynamicProgrammingTSP,
    url: "http://localhost:3020",
    cities: [10, 12, 16],
  },
];

const masters = [
  {
    name: "brute-force",
    Algorithm: BruteForceTSP,
    url: "http://localhost:3030",
    service: "brute-force-worker",
    cities: [10, 11, 12],
  },
  {
    name: "three-opt",
    Algorithm: ThreeOptTSP,
    url: "http://localhost:3040",
    service: "three-opt-worker",
    cities: [12, 14, 16],
  },
];

const algorithmOrder = [...singles, ...masters].map((entry) => entry.name);
const rows = [];

/**
 * Loads one of the sample graphs.
 * @param {number} cities - The number of cities in the graph.
 * @returns {Object} The graph data.
 */
function loadGraph(cities) {
  return require(path.join(graphsDir, `${cities}city-graph.json`));
}

/**
 * Finds the middle value of a list of numbers.
 * @param {number[]} values - The numbers to look at.
 * @returns {number} The median.
 */
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function sleep(waitTimeInMs) {
  return new Promise((resolve) => setTimeout(resolve, waitTimeInMs));
}

/**
 * Runs a solve function several times and records the wall-clock time of each run.
 * @param {Function} solve - Async function that returns the tour cost.
 * @returns {Promise<Object>} The median time in ms, every time and the cost.
 */
async function measure(solve) {
  const times = [];
  let cost;

  for (let run = 0; run < repeats; run++) {
    const start = performance.now();
    cost = await solve();
    times.push(performance.now() - start);
  }

  return { medianMs: median(times), timesMs: times, cost };
}

/**
 * Runs a function with console.log turned off, the algorithms log a lot.
 * @param {Function} fn - The function to run.
 * @returns {*} Whatever the function returns.
 */
function quietly(fn) {
  const log = console.log;
  console.log = () => {};
  try {
    return fn();
  } finally {
    console.log = log;
  }
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`);
  }
  return response.json();
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`);
  }
  return response.json();
}

/**
 * Sends a graph to a single-container service and waits for the answer.
 * @param {string} url - Base url of the service.
 * @param {Object} graph - The graph data.
 * @returns {Promise<number>} The cost of the tour.
 */
async function solveWithService(url, graph) {
  const { Cost } = await postJson(`${url}/solve`, { graph });
  return Cost;
}

/**
 * Sends a graph to a master and polls until the workers have finished the run.
 * @param {string} url - Base url of the master.
 * @param {Object} graph - The graph data.
 * @returns {Promise<number>} The cost of the tour.
 */
async function solveWithMaster(url, graph) {
  const { id } = await postJson(`${url}/solve`, { graph });
  let result = null;

  while (!result) {
    await sleep(pollInterval);
    ({ result } = await getJson(`${url}/result?id=${id}`));
  }

  return result.Cost;
}

/**
 * Scales both worker services and waits until each master sees that many workers.
 * @param {number} count - The number of workers per master.
 */
async function scaleWorkers(count) {
  const scaleArgs = masters.flatMap((master) => [
    "--scale",
    `${master.service}=${count}`,
  ]);
  execFileSync("docker", [...composeArgs, "up", "-d", ...scaleArgs], {
    stdio: ["ignore", 2, 2],
  });

  const deadline = Date.now() + workerWaitTimeout;
  for (const master of masters) {
    let workers = null;
    while (workers !== count) {
      if (Date.now() > deadline) {
        throw new Error(`${master.name} did not reach ${count} workers`);
      }
      await sleep(1000);
      ({ workers } = await getJson(`${master.url}/health`));
    }
  }
}

/**
 * Records one set of measurements.
 * @param {Object} entry - The algorithm entry.
 * @param {number} cities - The number of cities in the graph.
 * @param {string} setup - How it was run, e.g. "in-process" or "4 workers".
 * @param {Function} solve - Async function that returns the tour cost.
 */
async function record(entry, cities, setup, solve) {
  const result = await measure(solve);
  rows.push({ algorithm: entry.name, cities, setup, ...result });
  console.error(
    `${entry.name} ${cities} cities ${setup}: ${result.medianMs.toFixed(0)}ms`
  );
}

/**
 * Builds the Markdown table of the median times and costs.
 * @returns {string} The table.
 */
function toTable() {
  const sorted = [...rows].sort(
    (a, b) =>
      algorithmOrder.indexOf(a.algorithm) - algorithmOrder.indexOf(b.algorithm) ||
      a.cities - b.cities
  );
  const lines = [
    "| algorithm | cities | setup | median (ms) | cost |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const row of sorted) {
    lines.push(
      `| ${row.algorithm} | ${row.cities} | ${row.setup} | ${row.medianMs.toFixed(0)} | ${row.cost.toFixed(2)} |`
    );
  }

  return lines.join("\n");
}

/**
 * Describes the machine the numbers came from.
 * @returns {Object} CPU, memory and Docker resources.
 */
function describeMachine() {
  const docker = JSON.parse(
    execFileSync("docker", ["info", "--format", "{{json .}}"]).toString()
  );

  return {
    cpu: os.cpus()[0].model,
    cores: os.cpus().length,
    memoryGB: Math.round(os.totalmem() / 1024 ** 3),
    node: process.version,
    dockerCpus: docker.NCPU,
    dockerMemoryGB: Math.round(docker.MemTotal / 1024 ** 3),
  };
}

async function main() {
  for (const entry of [...singles, ...masters]) {
    for (const cities of entry.cities) {
      const graph = loadGraph(cities);
      await record(entry, cities, "in-process", async () =>
        quietly(() => new entry.Algorithm(graph).solve().totalDistance)
      );
    }
  }

  for (const entry of singles) {
    for (const cities of entry.cities) {
      const graph = loadGraph(cities);
      await record(entry, cities, "container", () =>
        solveWithService(entry.url, graph)
      );
    }
  }

  for (const count of workerCounts) {
    await scaleWorkers(count);
    for (const entry of masters) {
      for (const cities of entry.cities) {
        const graph = loadGraph(cities);
        await record(
          entry,
          cities,
          `${count} ${count === 1 ? "worker" : "workers"}`,
          () => solveWithMaster(entry.url, graph)
        );
      }
    }
  }

  const stamp = new Date().toISOString().replace(/:/g, "-");
  const file = path.join(resultsDir, `${stamp}.json`);
  fs.mkdirSync(resultsDir, { recursive: true });
  fs.writeFileSync(
    file,
    JSON.stringify(
      { date: new Date().toISOString(), machine: describeMachine(), repeats, rows },
      null,
      2
    ) + "\n"
  );

  console.log(toTable());
  console.error(`Results written to ${file}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
