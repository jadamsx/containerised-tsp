const chai = require("chai");
const path = require("path");
const { expect } = chai;
require("the-log").silent();
const fs = require("fs");
const { BruteForceTSP } = require("../src/brute-force");

const graphsDir = path.join(__dirname, "../../../../shared/graphs");
const graphFiles = fs
  .readdirSync(graphsDir)
  .filter((file) => file.endsWith(".json"));

let graphs = graphFiles.map((file) => require(path.join(graphsDir, file)));

graphs.sort((a, b) => a.coordinates.length - b.coordinates.length);

graphs = graphs.slice(0,4); // Remove larger graphs that are not feasible to test due to time constraints

function calculateAccuracy(expectedCost, calculatedCost) {
  const accuracy = (expectedCost / calculatedCost) * 100;
  return accuracy;
}

describe("Brute Force Algorithm", () => {
  for (const graph of graphs) {
    it(`Returns the most optimal tour and its cost for ${graph.name}!`, function(done) {
      this.timeout(30000);

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
