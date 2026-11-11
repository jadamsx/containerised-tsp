const chai = require("chai");
const chaiHttp = require("chai-http");
const path = require("path");
const { expect } = chai;
require("the-log").silent();
const fs = require("fs");
const net = require("net");
const express = require("express");
const { spawn } = require("child_process");
const { ThreeOptTSP } = require("../src/three-opt");

process.env.TASK_TIMEOUT_MS = "100";
const { app, queueApp } = require("../src/server");

chai.use(chaiHttp);


const graphsDir = path.join(__dirname, "../../../../shared/graphs");
const graphFiles = fs
  .readdirSync(graphsDir)
  .filter((file) => file.endsWith(".json"));

let graphs = graphFiles.map((file) => require(path.join(graphsDir, file)));

graphs.sort((a, b) => a.coordinates.length - b.coordinates.length);

graphs = graphs.slice(0,4); // Remove larger graphs that are not feasible to test due to time constraints

function calculateAccuracy(expectedCost, calculatedCost) {
  const accuracy = (expectedCost / calculatedCost) * 100;
  return accuracy;
}

describe("ThreeOpt Algorithm", () => {
  for (const graph of graphs) {
    it(`Returns a reasonably optimal tour and its cost for ${graph.name}!`, function(done) {
      this.timeout(30000);

      const tspInstance = new ThreeOptTSP(graph);
      const result = tspInstance.solve();

      expect(result).to.have.property("tour");
      expect(result).to.have.property("totalDistance");

      const accuracy = calculateAccuracy(graph.cost, result.totalDistance);
      expect(accuracy).to.be.at.least(97);
      expect(accuracy).to.be.at.most(100);
      done();
    });
  }
});

async function startRun(graph) {
  const res = await chai.request(app).post("/solve").send({ graph });
  return res.body.id;
}

async function takeTask() {
  const res = await chai.request(queueApp).get("/getTask");
  return res.body.task;
}

async function takeAllTasks() {
  const tasks = [];
  let task;
  while ((task = await takeTask())) {
    tasks.push(task);
  }
  return tasks;
}

function solveTask(task) {
  const { shortestTour, shortestDistance } = new ThreeOptTSP(task.data).improveTour(task.tour, task.totalDistance);
  return {
    id: task.id,
    index: task.index,
    tour: shortestTour,
    totalDistance: shortestDistance,
  };
}

async function returnTask(task) {
  return chai.request(queueApp).post("/returnTask").send({ result: solveTask(task) });
}

describe("Master", () => {
  it("keeps concurrent runs apart", async function() {
    const [small, large] = graphs;
    const smallId = await startRun(small);
    const largeId = await startRun(large);
    expect(smallId).to.not.equal(largeId);

    const tasks = await takeAllTasks();
    expect(tasks.map((task) => task.id)).to.include.members([smallId, largeId]);

    for (const task of tasks.reverse()) {
      await returnTask(task);
    }

    const smallResult = await chai.request(app).get(`/result?id=${smallId}`);
    const largeResult = await chai.request(app).get(`/result?id=${largeId}`);
    expect(smallResult.body.result.Tour).to.have.length(small.coordinates.length + 1);
    expect(largeResult.body.result.Tour).to.have.length(large.coordinates.length + 1);
    expect(smallResult.body.result.Cost).to.be.at.least(small.cost);
    expect(largeResult.body.result.Cost).to.be.at.least(large.cost);
  });

  it("hands a task out again once it times out", async function() {
    const id = await startRun(graphs[0]);
    const first = await takeTask();
    await new Promise((resolve) => setTimeout(resolve, 150));
    const second = await takeTask();
    expect(second.id).to.equal(id);
    expect(second.index).to.equal(first.index);

    for (const task of [second, ...(await takeAllTasks())]) {
      await returnTask(task);
    }
    const res = await chai.request(app).get(`/result?id=${id}`);
    expect(res.body.result).to.have.property("Cost");
  });

  it("rejects results for an unknown run", async function() {
    const res = await chai
      .request(queueApp)
      .post("/returnTask")
      .send({ result: { id: "nope", index: 0, tour: [], totalDistance: 0 } });
    expect(res).to.have.status(404);
  });
});

describe("Worker", () => {
  it("retries until the master is up", function(done) {
    this.timeout(10000);

    const probe = net.createServer().listen(0, () => {
      const port = probe.address().port;
      probe.close();

      const worker = spawn("node", [path.join(__dirname, "../src/worker.js")], {
        env: {
          ...process.env,
          THREE_OPT_MASTER_URL: `http://localhost:${port}`,
          RETRY_MIN_MS: "50",
          RETRY_MAX_MS: "200",
        },
        stdio: "ignore",
      });

      setTimeout(() => {
        expect(worker.exitCode).to.be.null;

        const master = express();
        const server = master.listen(port);
        master.get("/getTask", (req, res) => {
          res.json({ task: false });
          worker.kill();
          server.close();
          done();
        });
      }, 500);
    });
  });
});
