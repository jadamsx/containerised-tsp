# Brute Force TSP Service

Exhaustive search algorithm that evaluates all permutations to find the optimal tour. Distributed across master and worker processes for parallel computation.

## Algorithm

- **Time Complexity:** O(n!)
- **Accuracy:** 100% optimal
- **Practical limit:** ~11 cities

Brute force evaluates every possible tour permutation. The master process divides permutations into ranges and distributes them to workers, which compute local optima and return results to be aggregated.

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

- Master API: `http://localhost:3030`
- Queue/Worker coordination: `http://localhost:3031`

### Worker Mode (for distributed computation)

Start one or more worker processes pointing to a master:

```bash
BRUTE_FORCE_MASTER_URL=http://localhost:3031 node src/worker.js
```

In Kubernetes/remote deployment, point to your master service:

```bash
BRUTE_FORCE_MASTER_URL=http://brute-force-master-service:3031 node src/worker.js
```

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
    "Tour": [0, 1, 3, 2],
    "Cost": 4.0,
    "Time": 125
  }
}
```

## Environment Variables

- `BRUTE_FORCE_MASTER_URL` - Master queue endpoint for workers (default: `http://localhost:3031`)

## Testing

### Run Algorithm Tests

```bash
cd test
npx mocha intergrationTest.js
```

Tests the algorithm directly without requiring services to be running.

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

| Cities | Time | Permutations |
|--------|------|--------------|
| 8 | ~10ms | 40,320 |
| 10 | ~100ms | 3,628,800 |
| 11 | ~5s | 39,916,800 |
| 12 | ~60s | 479,001,600 |

## Docker

Build and run master:

```bash
docker build -t brute-force-service .
docker run -p 3030:3030 -p 3031:3031 brute-force-service
```

Run worker pointing to local master:

```bash
docker run -e BRUTE_FORCE_MASTER_URL=http://host.docker.internal:3031 brute-force-service node src/worker.js
```

