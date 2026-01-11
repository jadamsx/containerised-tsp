/**
 * BruteForceTSP class represents a solution to the Traveling Salesman Problem (TSP)
 * using the Brute Force algorithm. Similar to Dynamic Programming Approach but with
 * new functionality to allow for running in parallel.
 */
class BruteForceTSP {
  /**
   * Constructor for BruteForceTSP class.
   * @param {Object} data - TSPLIB formatted data.
   * @param {number[][]} data.coordinates - Array of city coordinates.
   */
  constructor(data) {
    this.data = data;
    this.coordinates = data.coordinates;
    this.numCities = data.coordinates.length;
  }

  /**
   * Generates a path based on the given index.
   * @param {number} index - The index to generate the path for.
   * @returns {number[]} - The generated path represented by an array of city indices.
   */
  generatePath(index) {
    const path = [0]; // Start each path with city 0
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

    path.push(path[0]); // Add the starting city to the end to complete the loop
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

    // Calculate the distance between each consecutive pair of cities in the path
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
   * Finds the shortest path and its distance from a range of possible paths.
   * @param {number} startIndex - Index of first path.
   * @param {number} stopIndex - Index of last path.
   * @returns {Object} - An object containing the shortest tour and the total distance of the tour.
   */
  solveInRange(startIndex, stopIndex) {
    let shortestTour = null;
    let shortestDistance = Infinity;

    for (let index = startIndex; index < stopIndex; index++) {
      const path = this.generatePath(index);
      const distance = this.calculatePathDistance(path);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        shortestTour = path;
      }
    }

    return { shortestTour, shortestDistance };
  }

  /**
   * Creates tasks to divide the solution into smaller chunks for parallel processing.
   * @returns {Array} - An array of tasks, each containing a startIndex and stopIndex.
   */
  createTasks() {
    const possibilities = Math.ceil(this.factorial(this.numCities - 1));
    const max = 10000000;
    const numTasks = Math.ceil(possibilities / max);
    const taskSize = Math.ceil(possibilities / numTasks);
    const tasks = [];

    let startIndex = 0;
    for (let index = 0; index < numTasks; index++) {
      const stopIndex =
        index === numTasks - 1 ? possibilities : startIndex + taskSize;
      tasks.push({
        startIndex,
        stopIndex,
        data: this.data,
      });
      startIndex = stopIndex;
    }

    return tasks;
  }

  /**
   * Solves the Traveling Salesman Problem by checking every possible path to find the shortest.
   * @returns {Object} - An object containing the shortest tour and the total distance of the tour.
   */
  solve() {
    const tasks = this.createTasks();
    let tour = null;
    let totalDistance = Infinity;

    for (const task of tasks) {
      const { shortestTour, shortestDistance } = this.solveInRange(
        task.startIndex,
        task.stopIndex
      );

      if (shortestDistance < totalDistance) {
        totalDistance = shortestDistance;
        tour = shortestTour;
      }
    }

    return { tour, totalDistance };
  }
}

module.exports = { BruteForceTSP };
