# Three-Opt TSP Service

Local search heuristic that iteratively improves tours by removing and reconnecting three edges. Distributed across master and worker processes.

## Algorithm

- **Time Complexity:** O(n³)
- **Accuracy:** 97-100% (near-optimal)
- **Practical limit:** 100+ cities

Three-Opt improves an initial tour by testing different ways to remove and reconnect three edges, accepting changes that reduce total distance. Much faster than Brute Force with near-optimal solutions.

## Prerequisites

```bash
npm install
```

## Running

### Master Mode (local development)

Both master and queue servers start automatically:

```bash
node src/server.js
```

- Master API: `http://localhost:3031`
- Queue/Worker coordination: `http://localhost:3041`

### Worker Mode (for distributed computation)

Start one or more worker processes pointing to a master:

```bash
THREE_OPT_MASTER_URL=http://localhost:3041 node src/worker.js
```

In remote deployment, point to your master service:

```bash
THREE_OPT_MASTER_URL=http://three-opt-master-service:3041 node src/worker.js
```

## API Endpoints

### POST /solve

Submit a graph to optimize.

```json
{
  "graph": {
    "name": "WS10",
    "coordinates": [[x1, y1], [x2, y2], ...],
    "cost": 150.5
  }
}
```

Response: `{"message": "Request received and processing started."}`

### GET /result

Poll for the optimized solution (returns `null` until complete).

```json
{
  "result": {
    "Tour": [0, 5, 2, 8, 1, 9, 3, 7, 4, 6],
    "Cost": 151.2,
    "Time": 450
  }
}
```

## Environment Variables

- `THREE_OPT_MASTER_URL` - Master queue endpoint for workers (default: `http://localhost:3041`)

## Testing

### Run Algorithm Tests

```bash
cd test
npx mocha intergrationTest.js
```

Tests the algorithm directly without requiring services.

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

Tests the HTTP API and distributed system.

## Performance

| Cities | Time | Accuracy |
|--------|------|----------|
| 8 | ~20ms | 99% |
| 10 | ~100ms | 98% |
| 15 | ~500ms | 97% |
| 20 | ~2s | 97% |
| 50 | ~50s | 97-99% |

## Docker

Build and run master:

```bash
docker build -t three-opt-service .
docker run -p 3031:3031 -p 3041:3041 three-opt-service
```

Run worker pointing to local master:

```bash
docker run -e THREE_OPT_MASTER_URL=http://host.docker.internal:3041 three-opt-service node src/worker.js
```

