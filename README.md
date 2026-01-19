# Traveling Salesman Problem - Containerized Solution

A containerized approach to solving the Traveling Salesman Problem (TSP) using multiple algorithms. This project demonstrates how distributed computing via containers allows TSP solutions to scale beyond a single machine's CPU cores.

## Project Overview

The project implements five different TSP solving algorithms:
- **Brute Force** - Exhaustive search, guarantees optimal solution
- **Dynamic Programming** - Optimal solution with polynomial time complexity
- **Three-Opt** - Heuristic local search, near-optimal solutions (~97-100% accuracy)
- **Cheapest Insertion** - Greedy heuristic, reasonable solutions (~50-100% accuracy)
- **Nearest Neighbour** - Simple greedy heuristic, reasonable solutions (~50-100% accuracy)

## Project Structure

```
containerised-tsp/
├── backend/
│   ├── multi-container/          # Services with distributed task queue
│   │   ├── brute-force/         # Master-worker distributed algorithm
│   │   └── three-opt/           # Master-worker distributed algorithm
│   ├── single-container/         # Standalone algorithm services
│   │   ├── dynamic-programming/
│   │   ├── cheapest-insertion/
│   │   └── nearest-neighbour/
│   └── (tests in each service)
├── frontend/
│   └── web-app/                 # Web UI and test orchestrator
├── shared/
│   ├── algorithms/              # Core algorithm implementations
│   └── graphs/                  # Test graph datasets
└── infra/                       # Kubernetes and deployment configs
```

## Quick Start

### Prerequisites
- Node.js (v15) and npm
- Docker (for containerized deployment)
- Kubernetes cluster (for distributed deployment)

### Local Development

**Install dependencies:**
```bash
npm install --prefix backend/multi-container/brute-force
npm install --prefix backend/multi-container/three-opt
npm install --prefix backend/single-container/dynamic-programming
npm install --prefix backend/single-container/cheapest-insertion
npm install --prefix backend/single-container/nearest-neighbour
npm install --prefix frontend/web-app
```

**Run tests:** Each service includes integration tests (algorithm-only) and API tests (full service):
```bash
# Integration test (no service required)
cd backend/single-container/nearest-neighbour/test && npx mocha intergrationTest.js

# API test (requires service running)
node backend/single-container/nearest-neighbour/src/server.js  # Terminal 1
cd backend/single-container/nearest-neighbour/test && npx mocha apiTest.js  # Terminal 2
```

Repeat the same pattern for other services (brute-force, three-opt, dynamic-programming, cheapest-insertion).

## Service Documentation

- [Brute Force Service](backend/multi-container/brute-force/README.md) - Distributed exhaustive search
- [Three-Opt Service](backend/multi-container/three-opt/README.md) - Distributed local search heuristic
- [Dynamic Programming Service](backend/single-container/dynamic-programming/README.md) - Optimal DP algorithm
- [Cheapest Insertion Service](backend/single-container/cheapest-insertion/README.md) - Greedy insertion heuristic
- [Nearest Neighbour Service](backend/single-container/nearest-neighbour/README.md) - Simple greedy heuristic
- [Frontend Web App](frontend/web-app/README.md) - Web UI and test orchestrator

## Algorithm Comparison

| Algorithm | Optimal | Time Complexity | Accuracy | Use Case |
|-----------|---------|-----------------|----------|----------|
| Brute Force | ✓ Yes | O(n!) | 100% | Small graphs (n ≤ 11) |
| Dynamic Programming | ✓ Yes | O(n² 2ⁿ) | 100% | Medium graphs (n ≤ 20) |
| Three-Opt | ✗ Heuristic | O(n³) | 97-100% | Large graphs, near-optimal |
| Cheapest Insertion | ✗ Heuristic | O(n²) | 50-100% | Large graphs, reasonable |
| Nearest Neighbour | ✗ Heuristic | O(n²) | 50-100% | Large graphs, fast |

## Environment Variables

All services and the frontend orchestrator support environment variable configuration for deployment. Set these before running the app or any service:

- `BRUTE_FORCE_URL` - Brute-force service endpoint (default: http://localhost:3030)
- `THREE_OPT_URL` - Three-opt service endpoint (default: http://localhost:3040)
- `NEAREST_NEIGHBOUR_URL` - Nearest neighbour service endpoint (default: http://localhost:3000/solve)
- `CHEAPEST_INSERTION_URL` - Cheapest insertion service endpoint (default: http://localhost:3010/solve)
- `DYNAMIC_PROGRAMMING_URL` - Dynamic programming service endpoint (default: http://localhost:3020/solve)


## Running with Docker

Build and run individual services:

### Brute Force
```bash
# Build locally
docker build -t ghcr.io/jadamsx/containerised-tsp/brute-force:latest ./backend/multi-container/brute-force
# Or pull from registry
docker pull ghcr.io/jadamsx/containerised-tsp/brute-force:latest
# Run
docker run -p 3030:3030 -p 3031:3031 ghcr.io/jadamsx/containerised-tsp/brute-force:latest
```

### Three-Opt
```bash
docker build -t ghcr.io/jadamsx/containerised-tsp/three-opt:latest ./backend/multi-container/three-opt
docker pull ghcr.io/jadamsx/containerised-tsp/three-opt:latest
docker run -p 3040:3040 -p 3041:3041 ghcr.io/jadamsx/containerised-tsp/three-opt:latest
```

### Dynamic Programming
```bash
docker build -t ghcr.io/jadamsx/containerised-tsp/dynamic-programming:latest ./backend/single-container/dynamic-programming
docker pull ghcr.io/jadamsx/containerised-tsp/dynamic-programming:latest
docker run -p 3020:3020 ghcr.io/jadamsx/containerised-tsp/dynamic-programming:latest
```

### Cheapest Insertion
```bash
docker build -t ghcr.io/jadamsx/containerised-tsp/cheapest-insertion:latest ./backend/single-container/cheapest-insertion
docker pull ghcr.io/jadamsx/containerised-tsp/cheapest-insertion:latest
docker run -p 3010:3010 ghcr.io/jadamsx/containerised-tsp/cheapest-insertion:latest
```

### Nearest Neighbour
```bash
docker build -t ghcr.io/jadamsx/containerised-tsp/nearest-neighbour:latest ./backend/single-container/nearest-neighbour
docker pull ghcr.io/jadamsx/containerised-tsp/nearest-neighbour:latest
docker run -p 3000:3000 ghcr.io/jadamsx/containerised-tsp/nearest-neighbour:latest
```

### Web App (Frontend)
```bash
docker build -t ghcr.io/jadamsx/containerised-tsp/web-app:latest ./frontend/web-app
docker pull ghcr.io/jadamsx/containerised-tsp/web-app:latest
docker run -p 8080:8080 ghcr.io/jadamsx/containerised-tsp/web-app:latest
```

# To use a specific version tag (e.g., v0.0.1):
```bash
docker pull ghcr.io/jadamsx/containerised-tsp/brute-force:v0.0.1
docker run -p 3030:3030 -p 3031:3031 ghcr.io/jadamsx/containerised-tsp/brute-force:v0.0.1
# ...repeat for other services as needed
```


