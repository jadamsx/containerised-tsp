/**
 * CheapestInsertionTSP class represents a solution to the Traveling Salesman Problem (TSP)
 * using the Cheapest Insertion algorithm.
 */
class CheapestInsertionTSP {
  /**
   * Constructor for CheapestInsertionTSP class.
   * @param {Object} data - TSPLIB formatted data.
   * @param {string} data.name - Name of the graph.
   * @param {number[][]} data.coordinates - Array of city coordinates.
   */
  constructor(data) {
    this.coordinates = data.coordinates;
    this.numCities = data.coordinates.length;
    this.tour = [];
    this.unvisitedCities = Array.from({ length: this.numCities }, (_, i) => i);
  }

  /**
   * Finds the cheapest insertion position for a new city in the existing tour.
   * @param {number[]} existingTour - The current tour.
   * @param {number} newCity - The new city to be inserted.
   * @returns {Object} - Object containing the position, added distance, and the new city.
   */
  findCheapestInsertion(existingTour, newCity) {
    let cheapestInsertion = {
      position: 0,
      addedDistance: Infinity,
      newCity: newCity,
    };

    for (let i = 0; i < existingTour.length - 1; i++) {
      const city1 = existingTour[i];
      const city2 = existingTour[i + 1];
      const addedDistance =
        this.distance(city1, newCity) +
        this.distance(newCity, city2) -
        this.distance(city1, city2);

      if (addedDistance < cheapestInsertion.addedDistance) {
        cheapestInsertion = {
          position: i + 1,
          addedDistance: addedDistance,
          newCity: newCity,
        };
      }
    }

    return cheapestInsertion;
  }

  /**
   * Calculates the total distance of the tour.
   * @returns {number} - The total distance of the tour.
   */
  calculateTotalDistance() {
    let totalDistance = 0;

    for (let i = 0; i < this.tour.length - 1; i++) {
      const city1 = this.tour[i];
      const city2 = this.tour[i + 1];
      totalDistance += this.distance(city1, city2);
    }

    return totalDistance;
  }

  /**
   * Solves the TSP using the Cheapest Insertion algorithm.
   * @returns {Object} - An object containing the tour and the total distance of the tour.
   */
  solve() {
    this.tour.push(0);
    this.tour.push(1);
    this.unvisitedCities.splice(this.unvisitedCities.indexOf(0), 1);
    this.unvisitedCities.splice(this.unvisitedCities.indexOf(1), 1);

    while (this.unvisitedCities.length > 0) {
      let cheapestInsertion = {
        position: 0,
        addedDistance: Infinity,
        newCity: null,
      };

      for (const newCity of this.unvisitedCities) {
        const insertion = this.findCheapestInsertion(this.tour, newCity);

        if (insertion.addedDistance < cheapestInsertion.addedDistance) {
          cheapestInsertion = {
            position: insertion.position,
            addedDistance: insertion.addedDistance,
            newCity: insertion.newCity,
          };
        }
      }

      this.tour.splice(
        cheapestInsertion.position,
        0,
        cheapestInsertion.newCity
      );
      this.unvisitedCities.splice(
        this.unvisitedCities.indexOf(cheapestInsertion.newCity),
        1
      );
    }

    this.tour.push(this.tour[0]);

    const totalDistance = this.calculateTotalDistance();

    return { tour: this.tour, totalDistance };
  }

  /**
   * Calculates the distance between two cities using Euclidean distance.
   * @param {number} city1 - The index of the first city.
   * @param {number} city2 - The index of the second city.
   * @returns {number} - The distance between the two cities.
   */
  distance(city1, city2) {
    const [x1, y1] = this.coordinates[city1];
    const [x2, y2] = this.coordinates[city2];
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
}

module.exports = { CheapestInsertionTSP };
