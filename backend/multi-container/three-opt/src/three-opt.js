const { NearestNeighborTSP } = require("./nearest-neighbour.js");

/**
 * Represents a solution to the Traveling Salesman Problem (TSP)
 * using the 3-opt local search algorithm. This algorithm explores various combinations
 * of edge swaps to find an improved tour.
 */
class ThreeOptTSP {
  /**
   * Initializes the ThreeOptTSP instance.
   * @param {Object} data - TSPLIB formatted data.
   * @param {number[][]} data.coordinates - Array of city coordinates.
   */
  constructor(data) {
    this.data = data;
    this.coordinates = data.coordinates;
    this.numCities = data.coordinates.length;
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
   * Swaps two edges and replaces with their cross.
   * @param {number[]} tour - The tour represented by an array of city indices.
   * @param {number} i - Index of the first node.
   * @param {number} j - Index of the second node.
   * @returns {number[]} - The new tour after 2-opt swap.
   */
  twoOptSwap(tour, i, j) {
    const newTour = tour.slice(0, i + 1);
    newTour.push(...tour.slice(i + 1, j + 1).reverse());
    newTour.push(...tour.slice(j + 1));
    return newTour;
  }

  /**
   * Swaps three edges based on the specified 3-opt case.
   * @param {number[]} tour - The tour represented by an array of city indices.
   * @param {number} i - Index of the first node.
   * @param {number} j - Index of the second node.
   * @param {number} k - Index of the third node.
   * @returns {number[]} - The new tour after the 3-opt swap.
   */
  threeOptSwap(tour, i, j, k) {
    const newTour = tour
      .slice(0, i + 1)
      .concat(tour.slice(j + 1, k + 1).reverse())
      .concat(tour.slice(i + 1, j + 1))
      .concat(tour.slice(k + 1));

    return newTour;
  }

  /**
   * Generates an initial suboptimal tour using Nearest Neighbor.
   * @returns {Object} - An object containing the initial tour and its distance.
   */
  getInitialTour() {
    const nnInstance = new NearestNeighborTSP(this.data);
    const { tour, totalDistance } = nnInstance.solve();
    return { initialTour: tour, initialDistance: totalDistance };
  }

  /**
   * Creates tasks to divide the solution into smaller chunks for parallel processing.
   * @param {number[][]} possibleTours - Array of possible tours.
   * @returns {Array} - An array of tasks, each containing necessary information for processing.
   */
  createTasks(possibleTours) {
    const tasks = [];

    for (let index = 0; index < possibleTours.length; index++) {
      let tour = possibleTours[index];
      let distance = this.calculatePathDistance(tour);

      tasks.push({
        tour: tour,
        totalDistance: distance,
        data: this.data,
      });
    }

    return tasks;
  }

  /**
   * Finds an array of promising tours to perform local searches on.
   * @param {number[]} tour - The initial tour represented by an array of city indices.
   * @param {number} totalDistance - The total distance of the initial tour.
   * @returns {Object} - An object containing the shortest tour, its distance, and an array of promising tours.
   */
  findPossibleTours(tour, totalDistance) {
    let improvementMade = true;
    let possibleTours = [];

    while (improvementMade) {
      improvementMade = false;
      for (let i = 0; i < this.numCities - 2; i++) {
        for (let j = i + 1; j < this.numCities - 1; j++) {
          for (let k = j + 1; k < this.numCities; k++) {
            let newTourCases = [];
            newTourCases.push(
              this.twoOptSwap(tour, i, j),
              this.twoOptSwap(tour, i, k),
              this.twoOptSwap(tour, j, k),
              this.threeOptSwap(tour, i, j, k),
              this.threeOptSwap(tour, i, k, j),
              this.threeOptSwap(tour, j, k, i),
              this.threeOptSwap(tour, j, i, k),
              this.threeOptSwap(tour, k, j, i),
              this.threeOptSwap(tour, k, i, j)
            );
            for (const newTour of newTourCases) {
              const distance = this.calculatePathDistance(newTour);
              if (distance <= totalDistance && !possibleTours.includes(tour)) {
                possibleTours.push(tour);
              }
              if (distance < totalDistance) {
                tour = newTour.slice();
                totalDistance = distance;
                improvementMade = true;
              }
            }
          }
        }
      }
    }

    return {
      shortestTour: tour,
      shortestDist: totalDistance,
      possibleTours: possibleTours,
    };
  }

  /**
   * Finds the shortest path and its distance from a via local search.
   * @param {number[]} tour - The initial tour represented by an array of city indices.
   * @param {number} totalDistance - The total distance of the initial tour.
   * @returns {Object} - An object containing the improved tour and its distance.
   */
  improveTour(tour, totalDistance) {
    let improvementMade = true;

    while (improvementMade) {
      improvementMade = false;
      for (let i = 0; i < this.numCities - 2; i++) {
        for (let j = i + 1; j < this.numCities - 1; j++) {
          for (let k = j + 1; k < this.numCities; k++) {
            let newTourCases = [];
            newTourCases.push(
              this.twoOptSwap(tour, i, j),
              this.twoOptSwap(tour, i, k),
              this.twoOptSwap(tour, j, k),
              this.threeOptSwap(tour, i, j, k),
              this.threeOptSwap(tour, i, k, j),
              this.threeOptSwap(tour, j, k, i),
              this.threeOptSwap(tour, j, i, k),
              this.threeOptSwap(tour, k, j, i),
              this.threeOptSwap(tour, k, i, j)
            );
            for (const newTour of newTourCases) {
              const distance = this.calculatePathDistance(newTour);
              if (distance < totalDistance) {
                tour = newTour.slice();
                totalDistance = distance;
                improvementMade = true;
              }
            }
          }
        }
      }
    }

    return {
      shortestTour: tour,
      shortestDistance: totalDistance,
    };
  }

  /**
   * Performs the 3-opt local search algorithm on the provided data.
   * @returns {Object} - An object containing the improved tour and its distance.
   */
  solve() {
    let { initialTour, initialDistance } = this.getInitialTour();
    console.log("Initial Distance: ", initialDistance);

    let { shortestTour, shortestDist, possibleTours } = this.findPossibleTours(
      initialTour,
      initialDistance
    );

    let tasks = this.createTasks(possibleTours);
    let totalDistance = shortestDist;
    let tour = shortestTour;

    console.log("Tasks Created: ", possibleTours.length);

    for (const task of tasks) {
      let { shortestTour, shortestDistance } = this.improveTour(
        task.tour,
        task.totalDistance
      );

      if (shortestDistance < totalDistance) {
        totalDistance = shortestDistance;
        tour = shortestTour;
      }
    }
    return { tour, totalDistance };
  }
}

module.exports = { ThreeOptTSP };
