const express = require("express");
const path = require("path");
const { performance } = require("perf_hooks");
const { ThreeOptTSP } = require("./three-opt");

const app = express();
const queueApp = express();
const port = process.env.PORT || 3040;
const queuePort = process.env.QUEUE_PORT || 3041;
const taskTimeout = Number(process.env.TASK_TIMEOUT_MS) || 5 * 60 * 1000;

const workerTimeout = Number(process.env.WORKER_TIMEOUT_MS) || 30 * 1000;
const runTtl = Number(process.env.RUN_TTL_MS) || 60 * 60 * 1000;

const runs = new Map();
const workers = new Map();
let latestRunId = null;

app.use(express.json());
queueApp.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/**
 * Renders the main page.
 */
app.get("/", (req, res) => {
  res.render("index");
});

/**
 * Reports that the master is up and how many workers are connected.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", workers: countWorkers() });
});

/**
 * Endpoint to initiate a new solution. Responds with the id of the run.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
app.post("/solve", (req, res) => {
  const graph = req.body.graph;
  if (!graph || !Array.isArray(graph.coordinates)) {
    res.status(400).json({ error: "A graph with coordinates is required." });
    return;
  }

  const id = Math.random().toString(36).substr(2, 9);
  const run = {
    id,
    createdAt: Date.now(),
    startTime: performance.now(),
    tasks: [],
    resultQueue: [],
    result: null,
  };
  runs.set(id, run);
  latestRunId = id;

  res.json({ message: "Request received and processing started.", id });
  solve(graph, run);
  return;
});

/**
 * Endpoint to provide result data to the client. Uses the latest run when no id is given.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
app.get("/result", (req, res) => {
  const run = runs.get(req.query.id || latestRunId);

  if (!run) {
    if (req.query.id) {
      res.status(404).json({ error: "Unknown run id." });
    } else {
      res.json({ result: null });
    }
    return;
  }

  if (run.result) {
    runs.delete(run.id);
  }
  res.json({ result: run.result });
  return;
});

/**
 * Retrieves the next task that is waiting for a worker, from any run.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
queueApp.get("/getTask", (req, res) => {
  const worker = req.query.worker;
  if (worker) {
    workers.set(worker, Date.now());
  }

  for (const run of runs.values()) {
    for (const task of run.tasks) {
      if (
        !task.completed &&
        (!task.collected || getTimeout(task.collectionTime))
      ) {
        console.log("Sending Task: ", task);

        task.collected = true;
        task.collectionTime = Date.now();
        task.worker = worker;
        res.json({ task });
        return;
      }
    }
  }
  res.json({ task: false });
  return;
});

/**
 * Endpoint to receive and process the result from workers.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
queueApp.post("/returnTask", (req, res) => {
  if (req.query.worker) {
    workers.set(req.query.worker, Date.now());
  }

  const result = req.body.result;
  const run = result && runs.get(result.id);

  if (!run) {
    res.sendStatus(404);
    return;
  }

  const task = run.tasks[result.index];
  if (!task) {
    res.sendStatus(400);
    return;
  }

  if (!task.completed) {
    task.completed = true;
    task.completionTime = Date.now();
    run.resultQueue.push(result);

    console.log("Received Result: ", run.resultQueue.length);

    if (run.resultQueue.length === run.tasks.length) {
      completeRun(run);
    }
  }

  res.sendStatus(200);
  return;
});

/**
 * Runs the initial 3-Opt search and adds the remaining local searches to the run.
 * @param {Object} graph - The graph data.
 * @param {Object} run - The run the tasks belong to.
 */
function solve(graph, run) {
  console.log("\n--New Solution Started--");

  try {
    const threeOptInstance = new ThreeOptTSP(graph);
    const { initialTour, initialDistance } = threeOptInstance.getInitialTour();

    console.log("Initial Distance: ", initialDistance);

    const { shortestTour, shortestDist, possibleTours } =
      threeOptInstance.findPossibleTours(initialTour, initialDistance);

    run.shortestTour = shortestTour;
    run.shortestDist = shortestDist;

    const tasks = threeOptInstance.createTasks(possibleTours);

    console.log(" Number Tasks Created: ", tasks.length);

    addTasksToRun(tasks, run);

    if (tasks.length === 0) {
      completeRun(run);
    }
  } catch (error) {
    console.error("Error sending tasks to queue:", error);
    runs.delete(run.id);
  }
}

/**
 * Finds the shortest path once every task of a run is completed.
 * @param {Object} run - The run to complete.
 */
function completeRun(run) {
  let shortestPath = run.shortestTour;
  let shortestDistance = run.shortestDist;

  for (const result of run.resultQueue) {
    if (result.totalDistance < shortestDistance) {
      shortestDistance = result.totalDistance;
      shortestPath = result.tour;
    }
  }

  console.log("--Solution Complete--");

  run.result = {
    Tour: shortestPath,
    Cost: shortestDistance,
    Time: performance.now() - run.startTime,
  };
}

/**
 * Adds tasks to a run.
 * @param {Array} tasks - An array of tasks to be added.
 * @param {Object} run - The run the tasks belong to, its id matches results to the correct solution.
 */
function addTasksToRun(tasks, run) {
  console.log("Adding Tasks to Queue");

  tasks.forEach((task, index) => {
    run.tasks.push({
      id: run.id,
      index: index,
      tour: task.tour,
      totalDistance: task.totalDistance,
      data: task.data,
      completed: false,
      collected: false,
      collectionTime: null,
      completionTime: null,
    });
  });
}

/**
 * Counts the workers that polled recently or are still working on a task.
 * @returns {number} The number of connected workers.
 */
function countWorkers() {
  const connected = new Set();

  for (const [worker, lastSeen] of workers) {
    if (Date.now() - lastSeen > workerTimeout) {
      workers.delete(worker);
    } else {
      connected.add(worker);
    }
  }

  for (const run of runs.values()) {
    for (const task of run.tasks) {
      if (
        task.worker &&
        task.collected &&
        !task.completed &&
        !getTimeout(task.collectionTime)
      ) {
        connected.add(task.worker);
      }
    }
  }

  return connected.size;
}

/**
 * Drops runs that are older than the run TTL, finished or not.
 */
function evictExpiredRuns() {
  for (const run of runs.values()) {
    if (Date.now() - run.createdAt > runTtl) {
      runs.delete(run.id);
    }
  }
}

/**
 * Calculates if a task has timed out.
 * @param {number} collectionTime - The time the task was collected.
 * @returns {boolean} Whether the task has timed out.
 */
function getTimeout(collectionTime) {
  return Date.now() - collectionTime > taskTimeout;
}

setInterval(evictExpiredRuns, Math.min(runTtl, 60 * 1000)).unref();

if (require.main === module) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Master listening on 0.0.0.0:${port}`);
  });
  queueApp.listen(queuePort, "0.0.0.0", () => {
    console.log(`Master queue listening on 0.0.0.0:${queuePort}`);
  });
}

module.exports = { app, queueApp };
