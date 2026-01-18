# Cheapest Insertion TSP Service

Greedy heuristic that builds tours by iteratively inserting cities at positions that increase tour length the least.

## Algorithm

- **Time Complexity:** O(n²)
- **Accuracy:** 50-100% (depends on problem structure)
- **Speed:** Very fast even for large graphs

Constructs a tour by starting with a partial tour and repeatedly adding unvisited cities at the position with minimum insertion cost. Good balance of speed and reasonable quality.

## Prerequisites

```bash
npm install
```

## Running

```bash
node src/server.js
```

Service listens on **Port 3010**.

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
    "Cost": 9.2,
    "Tour": [0, 1, 4, 2, 5, 3]
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

| Cities | Time | Accuracy Range |
|--------|------|-----------------|
| 10 | ~5ms | 55-95% |
| 20 | ~20ms | 50-90% |
| 50 | ~100ms | 50-85% |
| 100 | ~400ms | 50-80% |

## How It Works

1. Start with a small initial tour (3 cities)
2. For each remaining city, find the cheapest position to insert it
3. Insertion cost = distance(a, city) + distance(city, b) - distance(a, b)
4. Insert at position with minimum cost
5. Repeat until all cities added

## Docker

```bash
docker build -t cheapest-insertion-service .
docker run -p 3010:3010 cheapest-insertion-service
```

