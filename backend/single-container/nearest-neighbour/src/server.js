const express = require("express");
const ip = require("ip");
const path = require("path");
const { performance } = require("perf_hooks");
const { NearestNeighborTSP } = require("./nearest-neighbour");

const app = express();
const ipAddress = ip.address();
const ipPort = 3000;

app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

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

    const startTime = performance.now();
    const nearestNeighborInstance = new NearestNeighborTSP(graph);
    const nearestNeighborResult = nearestNeighborInstance.solve();
    const endTime = performance.now();
    const elapsedTime = endTime - startTime;

    res.json({
      Tour: nearestNeighborResult.tour,
      Cost: nearestNeighborResult.totalDistance,
      Time: elapsedTime,
    });
  };

  solveTSP();
});

app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`));
