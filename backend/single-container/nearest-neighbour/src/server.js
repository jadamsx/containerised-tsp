const express = require("express");
const ip = require("ip");
const path = require("path");
const { performance } = require("perf_hooks");
const { NearestNeighborTSP } = require("./nearest-neighbour");

const app = express();
const ipAddress = ip.address();
const ipPort = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Set the view engine and views directory for EJS templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route to render the main page
app.get("/", (req, res) => {
  res.render("index");
});

// Route to handle solving TSP using Nearest Neighbor algorithm
app.post("/solve", (req, res) => {
  /**
   * Solves the Traveling Salesman Problem (TSP) using the Nearest Neighbor algorithm.
   *
   * @param {Object} req - Express request object containing the graph data.
   * @param {Object} res - Express response object to send the result.
   * @returns {void}
   */
  const solveTSP = () => {
    const { graph } = req.body;

    // Measure the start time for performance evaluation
    const startTime = performance.now();

    // Create an instance of NearestNeighborTSP with the provided graph
    const nearestNeighborInstance = new NearestNeighborTSP(graph);

    // Solve the TSP using the Nearest Neighbor algorithm
    const nearestNeighborResult = nearestNeighborInstance.solve();

    // Measure the end time for performance evaluation
    const endTime = performance.now();

    // Calculate the elapsed time
    const elapsedTime = endTime - startTime;

    // Send the result as JSON response
    res.json({
      Tour: nearestNeighborResult.tour,
      Cost: nearestNeighborResult.totalDistance,
      Time: elapsedTime,
    });
  };

  // Call the solveTSP function
  solveTSP();
});

// Start the Express server
app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`));
