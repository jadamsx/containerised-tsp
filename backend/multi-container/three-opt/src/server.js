const ip = require("ip");
const express = require("express");
const path = require("path");
const { performance } = require("perf_hooks");
const { ThreeOptTSP } = require("./three-opt");

const app = express();
const queueApp = express();
const ipAddress = ip.address();
const ipPort = 3040;

let result = null;
let taskQueue = [];
let resultQueue = [];
let id;

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
 * Endpoint to initiate a new solution.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
app.post("/solve", async (req, res) => {
  result = null;
  taskQueue = [];
  resultQueue = [];
  id = Math.random().toString(36).substr(2, 9);

  res.json({ message: "Request received and processing started." });
  solve(req.body.graph);
  return;
});

/**
 * Endpoint to provide result data to the client.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
app.get("/result", (req, res) => {
  res.json({ result: result });
  result = null;  return;
});

/**
 * Retrieves the next task from the task queue.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
queueApp.get("/getTask", (req, res) => {
  for (let i = 0; i < taskQueue.length; i++) {
    if (
      !taskQueue[i].collected ||
      (taskQueue[i].collected &&
        getTimeout(taskQueue[i].collectionTime) &&
        !taskQueue[i].completed)
    ) {
      console.log("Sending Task: ", taskQueue[i]);

      taskQueue[i].collected = true;
      taskQueue[i].collectionTime = Date.now();
      res.json({ task: taskQueue[i] });

      taskQueue.push(taskQueue.splice(i, 1)[0]);
      return;
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
  const result = req.body.result;

  if (result.id === id) {
    resultQueue.push(result);

    console.log("Received Result: ", resultQueue.length);

    for (let i = taskQueue.length - 1; i >= 0; --i) {
      if (taskQueue.index === result.index) {
        taskQueue[i].completed = true;
        taskQueue[i].completionTime = Date.now();
        res.sendStatus(200);
        return;
      }
    }
  }

  res.sendStatus(200);
  return;
});

/**
 * Run the 3-Opt Local Search algorithm.
 * @param {Object} graph - The graph data.
 */
async function solve(graph) {
  console.log("\n--New Solution Started--");

  const startTime = performance.now();

  const threeOptInstance = new ThreeOptTSP(graph);
  let { initialTour, initialDistance } = threeOptInstance.getInitialTour();

  console.log("Initial Distance: ", initialDistance);

  let { shortestTour, shortestDist, possibleTours } =
    threeOptInstance.findPossibleTours(initialTour, initialDistance);

  const tasks = threeOptInstance.createTasks(possibleTours);

  console.log(" Number Tasks Created: ", tasks.length);

  try {
    addTasksToQueue(tasks, id);

    const { shortestPath, shortestDistance } = await checkTasksCompletion(
      shortestTour,
      shortestDist
    );

    const endTime = performance.now();

    const elapsedTime = endTime - startTime;

    console.log("--Solution Complete--");

    result = {
      Tour: shortestPath,
      Cost: shortestDistance,
      Time: elapsedTime,
    };
  } catch (error) {
    console.error("Error sending tasks to queue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Periodically checks if all tasks are completed and finds the shortest path.
 *
 * @param {number[]} shortestPath - The shortest tour found so far represented by an array of city indices.
 * @param {number} shortestDistance - The total distance of the said tour.
 * @returns {Object} The shortest path and its distance.
 */
async function checkTasksCompletion(shortestPath, shortestDistance) {
  console.log("Waiting for Results");

  while (resultQueue.length < taskQueue.length) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  for (const result of resultQueue) {
    if (result.totalDistance < shortestDistance) {
      shortestDistance = result.totalDistance;
      shortestPath = result.tour;
    }
  }
  return { shortestPath, shortestDistance };
}

/**
 * Adds tasks to the task queue.
 * @param {Array} tasks - An array of tasks to be added.
 * @param {String} id - Unique identifier to match tasks to correct solution.
 */
function addTasksToQueue(tasks, id) {
  let count = 0;

  console.log("Adding Tasks to Queue");

  for (task of tasks) {
    taskQueue.push({
      id: id,
      index: count,
      tour: task.tour,
      totalDistance: task.totalDistance,
      data: task.data,
      completed: false,
      collected: false,
      collectionTime: null,
      completionTime: null,
    });
    count++;
  }
}

/**
 * Calculates if a task has timed out.
 * @param {number} collectionTime - The time the task was collected.
 * @returns {boolean} Whether the task has timed out.
 */
function getTimeout(collectionTime) {
  const timeNow = Date.now();
  const timeDifference = timeNow - collectionTime;
  const timeDifferenceInMinutes = timeDifference / (1000 * 60);
  let timeoutValue = 5;

  return timeDifferenceInMinutes > timeoutValue;
}

app.listen(
  ipPort,
  console.log(`Master listening to ${ipAddress}:${ipPort} !!!`)
);
queueApp.listen(
  ipPort + 1,
  console.log(`Master listening to ${ipAddress}:${ipPort + 1} !!!`)
);
