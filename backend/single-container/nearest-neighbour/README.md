# Nearest Neighbour TSP Service

Simplest greedy heuristic that repeatedly visits the nearest unvisited city. Extremely fast but often produces suboptimal solutions.

## Algorithm

- **Time Complexity:** O(n²)
- **Accuracy:** 50-100% (highly variable)
- **Speed:** Fastest of all algorithms

Starts at an arbitrary city and repeatedly visits the nearest unvisited city until all are visited. Simple and very fast, but can produce tours 25%+ longer than optimal on some problems.

## Prerequisites

```bash
npm install
```

## Running

```bash
node src/server.js
```

Service listens on **Port 3000**.

## API Endpoints

### POST /solve

Submit a graph to optimize.

```json
{
  "graph": {
    "name": "Sample",
    "coordinates": [[0, 0], [1, 0], [1, 1], [0, 1], [0.5, 0.5], [2, 2]],
    "cost": 8.5
  }
}
```

Response: `{"message": "Request received and processing started."}`

### GET /result

Poll for the solution (returns `null` until complete).

```json
{
  "result": {
    "Cost": 10.1,
    "Tour": [0, 1, 2, 5, 4, 3]
  }
}
```

## Testing

### Run Algorithm Tests

```bash
cd test
npx mocha intergrationTest.js
```

Tests the algorithm directly without requiring the service.

### Run Full Service Tests

Terminal 1:
```bash
node src/server.js
```

Terminal 2:
```bash
cd test
npx mocha apiTest.js
```

Tests the HTTP API.

## How It Works

```
current = start_city
while unvisited cities remain:
  nearest = find closest unvisited city to current
  add nearest to tour
  current = nearest
return to start
```

## Docker

```bash
# Build locally
docker build -t ghcr.io/jadamsx/containerised-tsp/nearest-neighbour:latest .
# Or pull from registry
docker pull ghcr.io/jadamsx/containerised-tsp/nearest-neighbour:latest
# Run
docker run -p 3000:3000 ghcr.io/jadamsx/containerised-tsp/nearest-neighbour:latest
```

## Tips for Better Results

Run from multiple starting cities and keep the best result:

```bash
best_tour = null
for each starting_city:
  tour = nearest_neighbour(starting_city)
  if tour.cost < best_tour.cost:
    best_tour = tour
```

This multiplies computation time by n but often significantly improves solution quality.

