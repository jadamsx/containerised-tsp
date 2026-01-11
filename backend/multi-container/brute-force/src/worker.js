const axios = require("axios");
const { BruteForceTSP } = require("./brute-force");

const masterUrl = "http://brute-force-master-ser1:3031";
// const masterUrl = "http://localhost:3031";

/**
 * Worker function to continuously check for tasks, execute them, and submit results.
 */
async function work() {
  while (true) {
    try {
      const task = await getNextTask();
      if (task) {
        const { startIndex, stopIndex, data, id } = task;
        const result = executeTask(startIndex, stopIndex, data, id);
        await submitResult(result);
      }
    } catch (error) {
      console.log("Error occurred while processing task:", error);
    }

    // Pause for a short duration before checking for the next task
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

/**
 * Retrieves the next task from the master server.
 *
 * @returns {Object} The next task to be executed.
 */
async function getNextTask() {
  try {
    const response = await axios.get(`${masterUrl}/getTask`);
    const task = response.data.task;

    // Log whether a task is collected or not
    if (task) {
      console.log("\nNew task collected: ", task);
    } else {
      console.log("No Tasks Available");
    }

    return task;
  } catch (error) {
    console.error("Error retrieving task:", error);
    return null;
  }
}

/**
 * Executes a task and returns the result.
 * @param {number} startIndex - Index of the first path.
 * @param {number} stopIndex - Index of the last path.
 * @param {Object} data - Data required for the task.
 * @param {string} id - Identifier of the task.
 * @returns {Object} Result of the task.
 */
function executeTask(startIndex, stopIndex, data, id) {
  // Create an instance of BruteForceTSP
  const bruteForceInstance = new BruteForceTSP(data);

  // Generate paths chunk and find the shortest path
  const { shortestTour, shortestDistance } = bruteForceInstance.solveInRange(
    startIndex,
    stopIndex
  );

  // Return the result of the task
  return { id, tour: shortestTour, totalDistance: shortestDistance };
}

/**
 * Submits the result to the master server.
 * @param {Object} result - Result to be submitted.
 */
async function submitResult(result) {
  try {
    await axios.post(`${masterUrl}/returnTask`, { result });
    console.log("Result submitted successfully: ", result);
  } catch (error) {
    console.error("Error submitting result:", error);
  }
}

// Start the worker
work().catch(console.error);
