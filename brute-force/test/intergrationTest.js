// Import necessary modules
const chai = require("chai");
const path = require("path");
const { expect } = chai;
require("the-log").silent();
const fs = require("fs");
const { BruteForceTSP } = require("../src/brute-force");

// Read all JSON files in the 'graphs/' directory
const graphsDir = path.join(__dirname, "../graphs");
const graphFiles = fs
  .readdirSync(graphsDir)
  .filter((file) => file.endsWith(".json"));

// Create an array to store all graphs
const graphs = graphFiles.map((file) => require(path.join(graphsDir, file)));

// Sort the graphs array by the number of cities in each graph in ascending order
graphs.sort((a, b) => a.coordinates.length - b.coordinates.length);

graphs.splice(-5); // Remove larger graphs that are not feasible to test due to time constraints

function calculateAccuracy(actualCost, calculatedCost) {
  const difference = calculatedCost - actualCost;
  const accuracy = ((actualCost - difference) / actualCost) * 100;
  return accuracy;
}

// Describe the test suite for Brute Force Algorithm
describe("Brute Force Algorithm", () => {
  for (const graph of graphs) {
    it(`Returns the most optimal tour and its cost for ${graph.name}!`, (done) => {
      const tspInstance = new BruteForceTSP(graph);
      const result = tspInstance.solve();

      expect(result).to.have.property("tour");
      expect(result.totalDistance).to.equal(graph.cost);

      const accuracy = calculateAccuracy(graph.cost, result.totalDistance);
      expect(accuracy).to.equal(100);
      done();
    });
  }
});
