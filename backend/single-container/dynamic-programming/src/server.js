const express = require("express");
const path = require("path");
const { performance } = require("perf_hooks");
const { DynamicProgrammingTSP, MAX_CITIES } = require("./dynamic-programming");

const app = express();
const port = process.env.PORT || 3020;

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
   * Solves the Traveling Salesman Problem (TSP) using the Dynamic Programming approach.
   *
   * @param {Object} req - Express request object containing the graph data.
   * @param {Object} res - Express response object to send the result.
   * @returns {void}
   */
  const solveTSP = () => {
    const { graph } = req.body;

    if (graph.coordinates.length > MAX_CITIES) {
      res
        .status(400)
        .json({ error: `At most ${MAX_CITIES} cities are supported.` });
      return;
    }

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

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on 0.0.0.0:${port}`);
});
