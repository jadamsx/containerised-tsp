const express = require("express");
const ip = require("ip");
const path = require("path");
const { performance } = require("perf_hooks");
const { CheapestInsertionTSP } = require("./cheapest-insertion");

const app = express();
const ipAddress = ip.address();
const ipPort = 3010;

// Middleware to parse JSON requests
app.use(express.json());

// Set the view engine and views directory for EJS templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route to render the main page
app.get("/", (req, res) => {
  res.render("index");
});

// Route to handle solving TSP using Cheapest Insertion algorithm
app.post("/solve", (req, res) => {
  /**
   * Solves the Traveling Salesman Problem (TSP) using the Cheapest Insertion algorithm.
   *
   * @param {Object} req - Express request object containing the graph data.
   * @param {Object} res - Express response object to send the result.
   * @returns {void}
   */
  const solveTSP = () => {
    const { graph } = req.body;

    // Measure the start time for performance evaluation
    const startTime = performance.now();

    // Create an instance of CheapestInsertionTSP with the provided graph
    const cheapestInsertionInstance = new CheapestInsertionTSP(graph);

    // Solve the TSP using the Cheapest Insertion algorithm
    const cheapestInsertionResult = cheapestInsertionInstance.solve();

    // Measure the end time for performance evaluation
    const endTime = performance.now();

    // Calculate the elapsed time
    const elapsedTime = endTime - startTime;

    // Send the result as JSON response
    res.json({
      Tour: cheapestInsertionResult.tour,
      Cost: cheapestInsertionResult.totalDistance,
      Time: elapsedTime,
    });
  };

  // Call the solveTSP function
  solveTSP();
});

// Start the Express server
app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`));
