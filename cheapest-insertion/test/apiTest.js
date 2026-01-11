// Import necessary modules
const chai = require("chai");
const path = require("path");
const chaiHttp = require("chai-http");
const { expect } = chai;
const fs = require("fs");

// Use Chai HTTP for making HTTP requests
chai.use(chaiHttp);

// Set the base URL for API requests
const url = "http://localhost:3010";

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

// Describe the test suite for Cheapest-Insertion-Service API
describe("Cheapest-Insertion-Service API", () => {
  for (const graph of graphs) {
    it(`Returns a valid tour and cost for ${graph.name}!`, (done) => {
      const testData = { graph: graph };

      // Make a GET request to /solve chosen graph
      chai
        .request(url)
        .post("/solve")
        .send(testData)
        .end((err, res) => {
          // Validate the response
          expect(err).to.be.null;
          expect(res).to.have.status(200);

          expect(res.body).to.have.property("Tour");
          expect(res.body).to.have.property("Cost");
          expect(res.body).to.have.property("Time");

          const accuracy = calculateAccuracy(
            testData.graph.cost,
            res.body.Cost
          );
          expect(accuracy).to.be.at.least(50);
          expect(accuracy).to.be.at.most(100);
          done(); // Signal the end of the test
        });
    });
  }
});
