const express = require("express");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");
const multer = require("multer");
const parseFile = require("./parse-file.cjs");
const runTest = require("./run-tests.cjs");

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const sharedGraphsDir = path.join(__dirname, "../graphs");
const maxStoredRuns = 50;
const runs = new Map();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve React static files (after build)
app.use(express.static(path.join(__dirname, "../../web-app/dist")));

// API: Get available graphs
app.get("/api/graphs", (req, res) => {
  const files = fs.readdirSync(sharedGraphsDir).filter(f => f.endsWith('.json'));
  const graphs = files.map(file => {
    const content = fs.readFileSync(path.join(sharedGraphsDir, file), 'utf8');
    let json;
    try { json = JSON.parse(content); } catch { json = { name: file, coordinates: [] }; }
    return { name: json.name || file, coordinates: json.coordinates || [] };
  });
  res.json({ graphs });
});

// API: Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API: Run algorithm test
app.post("/test", upload.single("customGraph"), async (req, res) => {
  try {
    let graph;
    if (req.body.graphIndex === "-1") {
      if (!req.file) throw new Error("Please upload a custom graph file.");
      const customFileContent = req.file.buffer.toString("utf8");
      graph = parseFile(customFileContent);
    } else {
      const files = fs.readdirSync(sharedGraphsDir).filter(f => f.endsWith('.json'));
      const content = fs.readFileSync(path.join(sharedGraphsDir, files[parseInt(req.body.graphIndex)]), 'utf8');
      graph = JSON.parse(content);
    }
    const id = randomUUID();
    runs.set(id, await runTest(graph, req.body.algorithm));
    if (runs.size > maxStoredRuns) {
      runs.delete(runs.keys().next().value);
    }
    res.status(200).json({ ok: true, id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// API: Get result
app.get("/result", (req, res) => {
  if (!runs.has(req.query.id)) {
    return res.status(404).json({ error: "Unknown run id." });
  }
  res.json({ result: runs.get(req.query.id) });
});

// Fallback: Serve React index.html for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../web-app/dist/index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
