const chai = require("chai");
const path = require("path");
const { expect } = chai;
require("the-log").silent();
const fs = require("fs");
const { ThreeOptTSP } = require("../src/three-opt");


const graphsDir = path.join(__dirname, "../../../../shared/graphs");
const graphFiles = fs
  .readdirSync(graphsDir)
  .filter((file) => file.endsWith(".json"));

const graphs = graphFiles.map((file) => require(path.join(graphsDir, file)));

graphs.sort((a, b) => a.coordinates.length - b.coordinates.length);

function calculateAccuracy(expectedCost, calculatedCost) {
  const accuracy = (expectedCost / calculatedCost) * 100;
  return accuracy;
}

describe("ThreeOpt Algorithm", () => {
  for (const graph of graphs) {
    it(`Returns a reasonably optimal tour and its cost for ${graph.name}!`, (done) => {
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
