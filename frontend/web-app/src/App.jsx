
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AlgorithmForm from "./components/AlgorithmForm";
import ResultsPage from "./components/ResultsPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AlgorithmForm />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
