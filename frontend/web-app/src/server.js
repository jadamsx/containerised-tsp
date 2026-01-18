const express = require("express");
const path = require("path");
const ip = require("ip");
const runTest = require("./run-tests");
const parseFile = require("./parse-file");
const fs = require("fs");
const multer = require("multer");

const app = express();

const ipAddress = ip.address();

const ipPort = 8080;

const graphsDir = path.join(__dirname, "./graphs");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const graphFiles = fs
  .readdirSync(graphsDir)
  .filter((file) => file.endsWith(".json"));

let graphs = graphFiles.map((file) => require(path.join(graphsDir, file)));

graphs.sort((a, b) => a.coordinates.length - b.coordinates.length);

let resultData = null;

/**
 * Route to render the main page.
 * Renders the main page with the available graphs.
 */
app.get("/", (req, res) => {
  res.render("index", { graphs: graphs });
});

/**
 * Route to handle the algorithm test.
 * Runs the specified algorithm test with the provided graph data.
 */
app.post("/test", upload.single("customGraph"), async (req, res) => {
  resultData = null;
  try {
    let graph;
    res.render("result");

    if (req.body.graphIndex === "-1") {
      if (!req.file) {
        throw new Error("Please upload a custom graph file.");
      }

      const customFileContent = req.file.buffer.toString("utf8");
      graph = parseFile(customFileContent);
    } else {
      graph = graphs[parseInt(req.body.graphIndex)];
    }

    resultData = await runTest(graph, req.body.algorithm);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * Route to provide result data to the client.
 */
app.get("/result", (req, res) => {
  result = resultData;
  resultData = null;
  res.json({ result: result });
});

app.listen(ipPort, () => {
  console.log(`Listening to ${ipAddress}:${ipPort} !!!`);
});
