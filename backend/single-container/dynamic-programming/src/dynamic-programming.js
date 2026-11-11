/**
 * DynamicProgrammingTSP class represents a solution to the Traveling Salesman Problem (TSP)
 * using the Dynamic Programming algorithm.
 */
class DynamicProgrammingTSP {
  /**
   * Constructor for DynamicProgrammingTSP class.
   * @param {Object} data - TSPLIB formatted data.
   * @param {number[][]} data.coordinates - Array of city coordinates.
   */
  constructor(data) {
    this.coordinates = data.coordinates;
    this.numCities = data.coordinates.length;
  }

  /**
   * Precomputes the Euclidean distance between every pair of cities.
   * @returns {number[][]} - Matrix where entry [i][j] is the distance from city i to city j.
   */
  buildDistanceMatrix() {
    return this.coordinates.map(([x1, y1]) =>
      this.coordinates.map(([x2, y2]) =>
        Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      )
    );
  }

  /**
   * Calculates the total distance for a given path.
   * @param {number[]} path - The path represented by an array of city indices.
   * @returns {number} - The total distance of the tour.
   */
  calculatePathDistance(path) {
    let distance = 0;
    const n = path.length;


    for (let i = 0; i < n - 1; i++) {
      const cityIndex1 = path[i];
      const cityIndex2 = path[i + 1];
      const [x1, y1] = this.coordinates[cityIndex1];
      const [x2, y2] = this.coordinates[cityIndex2];
      distance += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    return distance;
  }

  /**
   * Solves the Traveling Salesman Problem with the Held-Karp algorithm.
   * Subsets of the cities 1..n-1 are bitmasks, and cost[subset][j] is the shortest
   * path from city 0 through every city in the subset that ends at city j.
   * @returns {Object} - An object containing the shortest tour and the total distance of the tour.
   */
  solve() {
    const n = this.numCities;
    if (n < 2) {
      return { tour: [0, 0], totalDistance: 0 };
    }

    const distances = this.buildDistanceMatrix();
    const m = n - 1;
    const full = (1 << m) - 1;
    const cost = new Float64Array((full + 1) * m).fill(Infinity);
    const parent = new Int32Array((full + 1) * m).fill(-1);

    for (let j = 0; j < m; j++) {
      cost[(1 << j) * m + j] = distances[0][j + 1];
    }

    for (let subset = 1; subset <= full; subset++) {
      for (let j = 0; j < m; j++) {
        if (!(subset & (1 << j))) continue;
        const current = cost[subset * m + j];

        for (let next = 0; next < m; next++) {
          if (subset & (1 << next)) continue;
          const nextSubset = subset | (1 << next);
          const candidate = current + distances[j + 1][next + 1];

          if (candidate < cost[nextSubset * m + next]) {
            cost[nextSubset * m + next] = candidate;
            parent[nextSubset * m + next] = j;
          }
        }
      }
    }

    let last = 0;
    let shortest = Infinity;
    for (let j = 0; j < m; j++) {
      const candidate = cost[full * m + j] + distances[j + 1][0];
      if (candidate < shortest) {
        shortest = candidate;
        last = j;
      }
    }

    const path = [0];
    let subset = full;
    while (last !== -1) {
      path.push(last + 1);
      const previous = parent[subset * m + last];
      subset ^= 1 << last;
      last = previous;
    }
    path.push(0);

    const tour = path.reverse();
    return { tour, totalDistance: this.calculatePathDistance(tour) };
  }
}

module.exports = { DynamicProgrammingTSP };
