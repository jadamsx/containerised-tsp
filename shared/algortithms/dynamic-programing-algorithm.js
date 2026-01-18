/**
 * DynamicProgrammingTSP class represents a solution to the Traveling Salesman Problem (TSP)
 * using the Dynamic Programming algorithm.
 */
class DynamicProgrammingTSP {
  /**
   * Constructor for DynamicProgrammingTSP class.
   * @param {Object} data - TSPLIB formatted data.
   * @param {string} data.name - Name of the graph.
   * @param {number[][]} data.coordinates - Array of city coordinates.
   */
  constructor(data) {
    this.coordinates = data.coordinates;
    this.numCities = data.coordinates.length;
  }

  /**
   * Generates a path based on the given index.
   * @param {number} index - The index to generate the path for.
   * @returns {number[]} - The generated path represented by an array of city indices.
   */
  generatePath(index) {
    const path = [0];
    const availableCities = Array.from(Array(this.numCities - 1).keys()).map(
      (i) => i + 1
    ); // Exclude city 0

    for (let j = this.numCities - 2; j >= 0; j--) {
      const factorial = this.factorial(j);
      const selectedCityIndex = Math.floor(index / factorial);
      const selectedCity = availableCities.splice(selectedCityIndex, 1)[0];
      path.push(selectedCity);
      index %= factorial;
    }

      path.push(path[0]);
    console.log(path);
    return path;
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
   * Calculates the factorial of a number.
   * @param {number} n - The number to calculate the factorial of.
   * @returns {number} - The factorial of the number.
   */
  factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  /**
   * Solves the Traveling Salesman Problem by checking every possible path to find the shortest.
   * @returns {Object} - An object containing the shortest tour and the total distance of the tour.
   */
  solve() {
    const possibilities = Math.ceil(this.factorial(this.numCities - 1));
    let tour = null;
    let totalDistance = Infinity;

    for (let index = 0; index < possibilities; index++) {
      const path = this.generatePath(index);
      const distance = this.calculatePathDistance(path);

      if (distance < totalDistance) {
        totalDistance = distance;
        tour = path;
      }
    }

    return { tour, totalDistance };
  }
}

module.exports = { DynamicProgrammingTSP };

// Example Usage:
// const data = {
//   name: "Sample TSP Instance",
//   coordinates: [
//     [0, 0],
//     [1, 2],
//     [3, 1],
//     [4, 3],
//   ],
// };

// const tspInstance = new DynamicProgrammingTSP(data);
// const { tour, totalDistance } = tspInstance.solve();
// console.log("Optimal Tour: ", tour);
// console.log("Total Distance: ", totalDistance);
