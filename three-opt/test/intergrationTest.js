// Import necessary modules
const chai = require("chai");
const path = require("path");
const { expect } = chai;
require("the-log").silent();
const fs = require("fs");
const { ThreeOptTSP } = require("../src/three-opt");

// Read all JSON files in the 'graphs/' directory
const graphsDir = path.join(__dirname, "../graphs");
const graphFiles = fs
  .readdirSync(graphsDir)
  .filter((file) => file.endsWith(".json"));

// Create an array to store all graphs
const graphs = graphFiles.map((file) => require(path.join(graphsDir, file)));

// Sort the graphs array by the number of cities in each graph in ascending order
graphs.sort((a, b) => a.coordinates.length - b.coordinates.length);

function calculateAccuracy(actualCost, calculatedCost) {
  const difference = calculatedCost - actualCost;
  const accuracy = ((actualCost - difference) / actualCost) * 100;
  return accuracy;
}

// Describe the test suite for ThreeOpt Algorithm
describe("ThreeOpt Algorithm", () => {
  for (const graph of graphs) {
    it(`Returns the most optimal tour and its cost for ${graph.name}!`, (done) => {
      const tspInstance = new ThreeOptTSP(graph);
      const result = tspInstance.solve();

      expect(result).to.have.property("tour");
      expect(result).to.have.property("totalDistance");

      const accuracy = calculateAccuracy(graph.cost, result.totalDistance);
      expect(accuracy).to.be.at.least(97);
      expect(accuracy).to.be.at.most(100);
      done();
    });
  }
});
