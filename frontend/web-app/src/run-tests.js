const axios = require("axios");
const sleep = (waitTimeInMs) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

/**
 * Sends a POST request to the specified URL with the provided data.
 *
 * @param {string} url - The URL to send the POST request to.
 * @param {Object} dataObj - The data to include in the request body.
 * @returns {Promise<Object>} - A promise that resolves to the response data.
 */
async function sendAxiosPost(url, dataObj) {
  try {
    const res = await axios.post(url, { graph: dataObj });
    return res.data;
  } catch (err) {
    console.log(err);
  }
}

/**
 * Sends a GET request to the specified URL with the provided data.
 *
 * @param {string} url - The URL to send the POST request to.
 * @param {Object} dataObj - The data to include in the request body.
 * @returns {Promise<Object>} - A promise that resolves to the response data.
 */
async function sendAxiosGet(url) {
  try {
    const response = await axios.get(url);
    return response.data.result;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

/**
 * Sends a request to a service and polls continuously for result.
 *
 * @param {string} url - The URL to connect to.
 * @param {Object} graph - The data to include in the request body.
 * @returns {Promise<Object>} - A promise that resolves to the response data.
 */
async function talkToService(url, graph) {
  try {
    const solveResponse = await sendAxiosPost(url + "/solve", graph);

    if (solveResponse.message === "Request received and processing started.") {
      console.log("Processing started. Waiting for result...");
    }

    let result = null;

    while (!result) {
      await sleep(3000);
      result = await sendAxiosGet(url + "/result");
    }

    console.log("Processing complete.");

    return result;
  } catch (error) {
    console.error("Error processing graph:", error.message);
  }
}

/**
 * Calculates the accuracy of a calculated cost compared to an expected cost.
 *
 * @param {number} expectedCost - The expected cost of the tour.
 * @param {number} calculatedCost - The calculated cost of the tour.
 * @returns {number} - The accuracy percentage of the calculated cost.
 */
function calculateAccuracy(expectedCost, calculatedCost) {
  const accuracy = (expectedCost / calculatedCost) * 100;
  return accuracy;
}

/**
 * Formats milliseconds into hours, minutes, seconds, and milliseconds.
 *
 * @param {number} milliseconds - The time duration in milliseconds.
 * @returns {string} - The formatted time string.
 */
function formatTime(milliseconds) {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const ms = (milliseconds % 1000).toFixed(2);

  const formattedHours = hours > 0 ? `${hours}h, ` : "";
  const formattedMinutes = minutes > 0 ? `${minutes}m, ` : "";
  const formattedSeconds = seconds > 0 ? `${seconds}s, ` : "";

  if (milliseconds < 1000) {
    return `${ms}ms`;
  } else {
    return `${formattedHours}${formattedMinutes}${formattedSeconds}${ms}ms`;
  }
}

/**
 * Runs a test for the specified graph and algorithm.
 *
 * @param {number} graph - The graph object containing the graph data.
 * @param {string} algorithm - The algorithm to test (e.g., "nearest-neighbour").
 * @returns {Promise<Object>} - A promise that resolves to the test result data.
 */
async function runTest(graph, algorithm) {
  let url = "";
  let res = {};
  switch (algorithm) {
    case "nearest-neighbour":
      url = "http://nearest-neighbor-ser1:3000/solve";
      res = await sendAxiosPost(url, graph, { timeout: 360000 });
      break;
    case "cheapest-insertion":
      url = "http://cheapest-insertion-ser1:3010/solve";
      res = await sendAxiosPost(url, graph, { timeout: 360000 });
      break;
    case "dynamic-programming":
      url = "http://dynamic-programming-ser1:3020/solve";
      res = await sendAxiosPost(url, graph, { timeout: 3600000 });
      break;
    case "brute-force":
      url = "http://brute-force-master-ser1:3030";

      res = await talkToService(url, graph);
      break;
    case "three-opt":
      url = "http://three-opt-master-ser1:3040";

      res = await talkToService(url, graph);
      break;
    default:
      console.log("Invalid choice.");
  }

  return {
    GraphName: graph.name,
    Coordinates: graph.coordinates,
    ExpectedTour: graph.tour,
    ExpectedCost: graph.cost,
    ActualTour: res.Tour,
    ActualCost: res.Cost,
    Time: formatTime(res.Time),
    Accuracy: calculateAccuracy(graph.cost, res.Cost),
  };
}

// Export the runTest function for external use
module.exports = runTest;
