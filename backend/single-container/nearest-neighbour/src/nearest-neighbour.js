/**
 * NearestNeighborTSP class represents a solution to the Traveling Salesman Problem (TSP)
 * using the Nearest Neighbor algorithm.
 */
class NearestNeighborTSP {
  /**
   * Constructor for NearestNeighborTSP class.
   * @param {Object} data - TSPLIB formatted data.
   * @param {string} data.name - Name of the graph.
   * @param {number[][]} data.coordinates - Array of city coordinates.
   */
  constructor(data) {
    this.name = data.name;
    this.coordinates = data.coordinates;
    this.numCities = data.coordinates.length;
    this.visited = new Array(this.numCities).fill(false);
  }

  /**
   * Finds the nearest neighbor to the current city that has not been visited yet.
   * @param {number} currentCity - The index of the current city.
   * @returns {number} - The index of the nearest neighbor.
   */
  findNearestNeighbor(currentCity) {
    let minDistance = Infinity;
    let nearestNeighbor = -1;

    for (let i = 0; i < this.numCities; i++) {
      if (!this.visited[i]) {
        const [x1, y1] = this.coordinates[currentCity];
        const [x2, y2] = this.coordinates[i];
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        if (distance < minDistance) {
          minDistance = distance;
          nearestNeighbor = i;
        }
      }
    }

    return nearestNeighbor;
  }

  /**
   * Solves the TSP using the Nearest Neighbor algorithm.
   * @returns {Object} - An object containing the tour and the total distance of the tour.
   */
  solve() {
    let tour = [];
    let totalDistance = 0;

    let currentCity = 0;
    this.visited[currentCity] = true;
    tour.push(currentCity);

    for (let i = 1; i < this.numCities; i++) {
      let nearestNeighbor = this.findNearestNeighbor(currentCity);
      this.visited[nearestNeighbor] = true;
      tour.push(nearestNeighbor);
      totalDistance += Math.sqrt(
        Math.pow(
          this.coordinates[currentCity][0] -
            this.coordinates[nearestNeighbor][0],
          2
        ) +
          Math.pow(
            this.coordinates[currentCity][1] -
              this.coordinates[nearestNeighbor][1],
            2
          )
      );
      currentCity = nearestNeighbor;
    }

    tour.push(tour[0]);
    totalDistance += Math.sqrt(
      Math.pow(
        this.coordinates[currentCity][0] - this.coordinates[tour[0]][0],
        2
      ) +
        Math.pow(
          this.coordinates[currentCity][1] - this.coordinates[tour[0]][1],
          2
        )
    );

    return { tour, totalDistance };
  }
}

module.exports = { NearestNeighborTSP };
