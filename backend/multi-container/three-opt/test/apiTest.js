const chai = require("chai");
const path = require("path");
const chaiHttp = require("chai-http");
const { expect } = chai;
const fs = require("fs");

chai.use(chaiHttp);

const url = "http://localhost:3040";

const graphsDir = path.join(__dirname, "../../../../shared/graphs");
const graphFiles = fs
  .readdirSync(graphsDir)
  .filter((file) => file.endsWith(".json"));

const graphs = graphFiles.map((file) => require(path.join(graphsDir, file)));

graphs.sort((a, b) => a.coordinates.length - b.coordinates.length);

graphs.slice(0,4); // Remove larger graphs that are not feasible to test due to time constraints

function calculateAccuracy(expectedCost, calculatedCost) {
  const accuracy = (expectedCost / calculatedCost) * 100;
  return accuracy;
}


describe("ThreeOpt-Service  API", () => {
  for (const graph of graphs) {
    it(`Returns the most optimal tour and its cost for ${graph.name}!`, function(done) {
      this.timeout(30000);

      const testData = { graph: graph };

      chai
        .request(url)
        .post("/solve")
        .send(testData)
        .end(async (err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property(
            "message",
            "Request received and processing started."
          );

          let result = null;

          while (!result) {
            try {
              const resultResponse = await chai.request(url).get("/result");
              result = resultResponse.body.result;
            } catch (error) {
              console.error("Error:", error.message);
            }
          }

          expect(result).to.have.property("Tour");
          expect(result).to.have.property("Cost");
          expect(result).to.have.property("Time");

          const accuracy = calculateAccuracy(testData.graph.cost, result.Cost);
          expect(accuracy).to.be.at.least(97);
          expect(accuracy).to.be.at.most(100);
          done();
        });
    });
  }
});
