# Frontend Web App

Web interface and test orchestrator for the TSP services.

## Prerequisites

```bash
npm install
```

## Running

```bash
node src/server.js
```

Server listens on **Port 3040**.

Access at: `http://localhost:3040`

## Test Orchestrator

Automatically runs and aggregates test results from all TSP algorithms:

```bash
node src/run-tests.js
```

Runs all algorithms against test graphs and displays:
- Pass/fail status
- Solution accuracy
- Execution times
- Error details

## Features

- **Web UI** for graph visualization and algorithm selection
- **Test orchestrator** that runs and aggregates all backend service tests
- **Accuracy reporting** with per-algorithm thresholds:
  - Brute Force: 100%
  - Dynamic Programming: 100%
  - Three-Opt: 97-100%
  - Cheapest Insertion: 50-100%
  - Nearest Neighbour: 50-100%

## Testing

The test orchestrator connects to services on default ports:

| Service | Port |
|---------|------|
| Nearest Neighbour | 3000 |
| Cheapest Insertion | 3010 |
| Dynamic Programming | 3020 |
| Brute Force | 3030 |
| Three-Opt | 3031 |

All backend services must be running for tests to pass. For algorithm-only tests without services, run each service's integration tests directly:

```bash
cd ../backend/*/test
npx mocha intergrationTest.js
```

## Docker

```bash
docker build -t tsp-frontend .
docker run -p 3040:3040 tsp-frontend
```

Requires backend services to be accessible on the network.

## Project Layout

```
frontend/web-app/
├── src/
│   ├── server.js           # Express server
│   ├── run-tests.js        # Test orchestrator
│   ├── parse-file.js       # Graph file parser
│   └── views/
│       └── index.ejs       # Web UI
├── package.json
└── README.md
```

