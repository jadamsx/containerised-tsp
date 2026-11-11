const axios = require("axios");
const { BruteForceTSP } = require("./brute-force");

const masterUrl = process.env.BRUTE_FORCE_MASTER_URL || "http://localhost:3031";
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
          task.index,
          task.startIndex,
          task.stopIndex,
          task.data,
          task.id
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

  if (task) {
    console.log("\nNew task collected: ", task);
  } else {
    console.log("No Tasks Available");
  }

  return task;
}

/**
 * Executes a task and returns the result.
 * @param {number} index - Position of the task within its run.
 * @param {number} startIndex - Index of the first path.
 * @param {number} stopIndex - Index of the last path.
 * @param {Object} data - Data required for the task.
 * @param {string} id - Identifier of the task.
 * @returns {Object} Result of the task.
 */
function executeTask(index, startIndex, stopIndex, data, id) {
  const bruteForceInstance = new BruteForceTSP(data);

  const { shortestTour, shortestDistance } = bruteForceInstance.solveInRange(
    startIndex,
    stopIndex
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
