const axios = require("axios");
const { ThreeOptTSP } = require("./three-opt");

const masterUrl = process.env.THREE_OPT_URL || "http://localhost:3041";

/**
 * Worker function to continuously check for tasks, execute them, and submit results.
 */
async function work() {
  while (true) {
    try {
      const task = await getNextTask();
      if (task) {
        const { id, tour, totalDistance, data } = task;
        const result = executeTask(id, tour, totalDistance, data);
        await submitResult(result);
      }
    } catch (error) {
      console.log("Error occurred while processing task:", error);
    }
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
 * @param {string} id - Identifier of the task.
 * @param {number} tour - The initial tour represented by an array of city indices.
 * @param {number} totalDistance - The total distance of the initial tour.
 * @param {Object} data - Data required for the task.
 * @returns {Object} Result of the task.
 */
function executeTask(id, tour, totalDistance, data) {
  // Create an instance of ThreeOptTsp
  const threeOptInstance = new ThreeOptTSP(data);

  // Generate paths chunk and find the shortest path
  const { shortestTour, shortestDistance } = threeOptInstance.improveTour(
    tour,
    totalDistance
  );

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


work().catch(console.error);
