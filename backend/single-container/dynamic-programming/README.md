# Dynamic Programming TSP Service

Optimal algorithm using the Held-Karp dynamic programming approach. Guarantees finding the optimal tour with better performance than Brute Force.

## Algorithm

- **Time Complexity:** O(n² 2ⁿ)
- **Accuracy:** 100% optimal
- **Practical limit:** ~20 cities

Uses memoization to avoid recalculating subproblems. Builds solutions from smaller subsets of cities upward, guaranteeing optimality with exponential (but better than factorial) time complexity.

## Prerequisites

```bash
npm install
```

## Running

```bash
node src/server.js
```

Service listens on **Port 3020**.

## API Endpoints

### POST /solve

Submit a graph to solve.

```json
{
  "graph": {
    "name": "GRID04",
    "coordinates": [[0, 0], [1, 0], [1, 1], [0, 1]],
    "cost": 4.0
  }
}
```

Response: `{"message": "Request received and processing started."}`

### GET /result

Poll for the solution (returns `null` until complete).

```json
{
  "result": {
    "Cost": 4.0,
    "Tour": [0, 1, 3, 2]
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

## Performance

| Cities | Time | Memory |
|--------|------|--------|
| 10 | ~20ms | ~5MB |
| 12 | ~500ms | ~50MB |
| 14 | ~5s | ~500MB |
| 15 | ~15s | ~1GB |

## Docker

```bash
docker build -t dynamic-programming-service .
docker run -p 3020:3020 dynamic-programming-service
```

