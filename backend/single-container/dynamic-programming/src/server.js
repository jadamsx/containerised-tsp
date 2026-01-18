const express = require("express");
const ip = require("ip");
const path = require("path");
const { performance } = require("perf_hooks");
const { DynamicProgrammingTSP } = require("./dynamic-programming");

const app = express();
const ipAddress = ip.address();
const ipPort = 3020;

app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/solve", (req, res) => {
  /**
   * Solves the Traveling Salesman Problem (TSP) using the Dynamic Programming approach.
   *
   * @param {Object} req - Express request object containing the graph data.
   * @param {Object} res - Express response object to send the result.
   * @returns {void}
   */
  const solveTSP = () => {
    const { graph } = req.body;

    const startTime = performance.now();
    const dynamicProgrammingInstance = new DynamicProgrammingTSP(graph);
    const dynamicProgrammingResult = dynamicProgrammingInstance.solve();
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    res.json({
      Tour: dynamicProgrammingResult.tour,
      Cost: dynamicProgrammingResult.totalDistance,
      Time: elapsedTime,
    });
  };

  solveTSP();
});

app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`));
