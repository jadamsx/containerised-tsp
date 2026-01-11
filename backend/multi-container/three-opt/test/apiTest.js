// Import necessary modules
const chai = require("chai");
const path = require("path");
const chaiHttp = require("chai-http");
const { expect } = chai;
const fs = require("fs");

// Use Chai HTTP for making HTTP requests
chai.use(chaiHttp);

// Set the base URL for API requests
const url = "http://localhost:3040";

// Read all JSON files in the 'graphs/' directory
const graphsDir = path.join(__dirname, "../../../graphs");
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

// Describe the test suite for ThreeOpt-Service API
describe("ThreeOpt-Service  API", () => {
  for (const graph of graphs) {
    it(`Returns the most optimal tour and its cost for ${graph.name}!`, (done) => {
      const testData = { graph: graph };

      // Make a POST request to /solve to start the solution
      chai
        .request(url)
        .post("/solve")
        .send(testData)
        .end(async (err, res) => {
          // Validate the response for starting the solution
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property(
            "message",
            "Request received and processing started."
          );

          let result = null;

          // Continuously check for the result until it's not null
          while (!result) {
            try {
              // Make a GET request to /result to get the result
              const resultResponse = await chai.request(url).get("/result");
              result = resultResponse.body.result;
            } catch (error) {
              // Ignore the error and continue checking
              console.error("Error:", error.message);
            }
          }

          // Validate the result
          expect(result).to.have.property("Tour");
          expect(result).to.have.property("Cost");
          expect(result).to.have.property("Time");

          const accuracy = calculateAccuracy(testData.graph.cost, result.Cost);
          expect(accuracy).to.be.at.least(97);
          expect(accuracy).to.be.at.most(100);
          done(); // Signal the end of the test
        });
    });
  }
});
