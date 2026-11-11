const axios = require("axios");
const { ThreeOptTSP } = require("./three-opt");

const masterUrl = process.env.THREE_OPT_MASTER_URL || "http://localhost:3041";
const retryMin = Number(process.env.RETRY_MIN_MS) || 1000;
const retryMax = Number(process.env.RETRY_MAX_MS) || 30000;
const pollInterval = 1000;
const workerId = Math.random().toString(36).substr(2, 9);

const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

/**
 * Worker function to continuously check for tasks, execute them, and submit results.
 * Keeps retrying with a growing delay while the master is unreachable.
 */
async function work() {
  let retryDelay = retryMin;
  let result = null;

  while (true) {
    try {
      if (!result) {
        const task = await getNextTask();
        retryDelay = retryMin;

        if (!task) {
          await sleep(pollInterval);
          continue;
        }
        result = executeTask(
          task.id,
          task.index,
          task.tour,
          task.totalDistance,
          task.data
        );
      }

      await submitResult(result);
      result = null;
    } catch (error) {
      console.error(
        `Error occurred, retrying in ${retryDelay}ms:`,
        error.message
      );
      await sleep(retryDelay);
      retryDelay = Math.min(retryDelay * 2, retryMax);
    }
  }
}

/**
 * Retrieves the next task from the master server.
 *
 * @returns {Object} The next task to be executed.
 */
async function getNextTask() {
  const response = await axios.get(`${masterUrl}/getTask`, {
    params: { worker: workerId },
  });
  const task = response.data.task;

  // Log whether a task is collected or not
  if (task) {
    console.log("\nNew task collected: ", task);
  } else {
    console.log("No Tasks Available");
  }

  return task;
}

/**
 * Executes a task and returns the result.
 * @param {string} id - Identifier of the run the task belongs to.
 * @param {number} index - Position of the task within its run.
 * @param {number} tour - The initial tour represented by an array of city indices.
 * @param {number} totalDistance - The total distance of the initial tour.
 * @param {Object} data - Data required for the task.
 * @returns {Object} Result of the task.
 */
function executeTask(id, index, tour, totalDistance, data) {
  // Create an instance of ThreeOptTsp
  const threeOptInstance = new ThreeOptTSP(data);

  // Generate paths chunk and find the shortest path
  const { shortestTour, shortestDistance } = threeOptInstance.improveTour(
    tour,
    totalDistance
  );

  return { id, index, tour: shortestTour, totalDistance: shortestDistance };
}

/**
 * Submits the result to the master server.
 * @param {Object} result - Result to be submitted.
 */
async function submitResult(result) {
  try {
    await axios.post(`${masterUrl}/returnTask`, { result }, {
      params: { worker: workerId },
    });
    console.log("Result submitted successfully: ", result);
  } catch (error) {
    if (!error.response) throw error;
    console.error("Result rejected by master:", error.response.status);
  }
}

work().catch(console.error);
