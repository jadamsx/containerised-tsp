const chai = require("chai");
const path = require("path");
const chaiHttp = require("chai-http");
const { expect } = chai;
const fs = require("fs");

chai.use(chaiHttp);

const url = "http://localhost:3000";

const graphsDir = path.join(__dirname, "../../../../shared/graphs");
const graphFiles = fs
  .readdirSync(graphsDir)
  .filter((file) => file.endsWith(".json"));

const graphs = graphFiles.map((file) => require(path.join(graphsDir, file)));

graphs.sort((a, b) => a.coordinates.length - b.coordinates.length);

graphs = graphs.slice(0,4); // Remove larger graphs that are not feasible to test due to time constraints

function calculateAccuracy(expectedCost, calculatedCost) {
  const accuracy = (expectedCost / calculatedCost) * 100;
  return accuracy;
}


describe("Nearest-Neighbor-service API", () => {
  for (const graph of graphs) {
    it(`Returns a valid tour and cost for ${graph.name}!`, (done) => {
      this.timeout(30000);

      const testData = { graph: graph };

      chai
        .request(url)
        .post("/solve")
        .send(testData)
        .end(async (err, res) => {
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
          done();        });
    });
  }
});
