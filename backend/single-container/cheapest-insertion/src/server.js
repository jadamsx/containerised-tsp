const express = require("express");
const ip = require("ip");
const path = require("path");
const { performance } = require("perf_hooks");
const { CheapestInsertionTSP } = require("./cheapest-insertion");

const app = express();
const ipAddress = ip.address();
const ipPort = 3010;

app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

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

    const startTime = performance.now();

    const cheapestInsertionInstance = new CheapestInsertionTSP(graph);

    const cheapestInsertionResult = cheapestInsertionInstance.solve();

    const endTime = performance.now();

    const elapsedTime = endTime - startTime;

    res.json({
      Tour: cheapestInsertionResult.tour,
      Cost: cheapestInsertionResult.totalDistance,
      Time: elapsedTime,
    });
  };

  solveTSP();
});

app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`));
