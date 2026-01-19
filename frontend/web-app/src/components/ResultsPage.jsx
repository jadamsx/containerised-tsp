import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TourCanvas from "./TourCanvas";
import axios from "axios";

function ResultsPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchResult = async () => {
      try {
        const res = await axios.get("/result");
        if (res.data.result) {
          if (isMounted) {
            setResult(res.data.result);
            setLoading(false);
          }
        } else {
          setTimeout(fetchResult, 1000);
        }
      } catch {
        setTimeout(fetchResult, 1000);
      }
    };
    fetchResult();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return <div><h1>Test Result</h1><p>Loading...</p></div>;
  }

  return (
    <div className="result-container">
      <h1>Test Result</h1>
      <p>Graph Name: <span>{result.GraphName}</span></p>
      <p>Expected Cost: <span>{result.ExpectedCost}</span></p>
      <p>Actual Cost: <span>{result.ActualCost}</span></p>
      <p>Time: <span>{result.Time}</span></p>
      <p>Accuracy: <span>{result.Accuracy}</span>%</p>
      <TourCanvas data={result} />
      <button onClick={() => navigate("/")}>Return to Main Page</button>
    </div>
  );
}

export default ResultsPage;
