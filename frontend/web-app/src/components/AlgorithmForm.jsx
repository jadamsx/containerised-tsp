import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const algorithms = [
  { value: "nearest-neighbour", label: "Nearest Neighbor" },
  { value: "cheapest-insertion", label: "Cheapest Insertion" },
  { value: "dynamic-programming", label: "Dynamic Programming" },
  { value: "brute-force", label: "Brute Force" },
  { value: "three-opt", label: "3-Opt Local Search" },
];

function AlgorithmForm() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0].value);
  const [graphs, setGraphs] = useState([]);
  const [selectedGraph, setSelectedGraph] = useState(0);
  const [customFile, setCustomFile] = useState(null);
  const [showFileInput, setShowFileInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available graphs from backend
    axios.get("/api/graphs")
      .then(res => setGraphs(res.data.graphs))
      .catch(() => setGraphs([]));
  }, []);

  const handleGraphChange = (e) => {
    const value = e.target.value;
    setSelectedGraph(value);
    setShowFileInput(value === "-1");
  };

  const handleFileChange = (e) => {
    setCustomFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("algorithm", selectedAlgorithm);
    formData.append("graphIndex", selectedGraph);
    if (customFile) formData.append("customGraph", customFile);
    try {
      await axios.post("/test", formData);
      navigate("/results");
    } catch (err) {
      alert("Error submitting test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>TSP Solver</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label htmlFor="algorithm">Choose Algorithm:</label>
        <select
          name="algorithm"
          id="algorithm"
          value={selectedAlgorithm}
          onChange={e => setSelectedAlgorithm(e.target.value)}
        >
          {algorithms.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>

        <label htmlFor="graph-size">Choose Graph Size:</label>
          <select
            name="graphIndex"
            id="graph-size"
            value={selectedGraph}
            onChange={handleGraphChange}
          >
            {(Array.isArray(graphs) ? graphs : []).map((g, idx) => (
              <option key={idx} value={idx}>{g.name || `Graph ${idx+1}`}</option>
            ))}
            <option value="-1">Custom Graph</option>
          </select>

        {showFileInput && (
          <div className="file-input-container">
            <label htmlFor="customGraph">Upload Your Graph File (TSPLIB Format):</label>
            <input
              type="file"
              name="customGraph"
              id="customGraph"
              onChange={handleFileChange}
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Solving..." : "Solve"}
        </button>
      </form>
    </div>
  );
}

export default AlgorithmForm;
