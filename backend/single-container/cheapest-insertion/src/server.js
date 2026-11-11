const express = require("express");
const path = require("path");
const { performance } = require("perf_hooks");
const { CheapestInsertionTSP } = require("./cheapest-insertion");

const app = express();
const port = process.env.PORT || 3010;

app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
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

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on 0.0.0.0:${port}`);
});
