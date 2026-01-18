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
- Node.js (v14+) and npm
- Docker (for containerized deployment)
- Optional: Kubernetes cluster for distributed deployment

### Local Development

1. **Install dependencies** for all services:
```bash
npm install --prefix backend/multi-container/brute-force
npm install --prefix backend/multi-container/three-opt
npm install --prefix backend/single-container/dynamic-programming
npm install --prefix backend/single-container/cheapest-insertion
npm install --prefix backend/single-container/nearest-neighbour
npm install --prefix frontend/web-app
```

2. **Run integration tests** (tests algorithms directly without requiring running services):
```bash
cd backend/multi-container/brute-force/test && npx mocha intergrationTest.js
cd backend/multi-container/three-opt/test && npx mocha intergrationTest.js
cd backend/single-container/dynamic-programming/test && npx mocha intergrationTest.js
cd backend/single-container/cheapest-insertion/test && npx mocha intergrationTest.js
cd backend/single-container/nearest-neighbour/test && npx mocha intergrationTest.js
```

3. **Run services locally**:
```bash
# In separate terminals
node backend/multi-container/brute-force/src/server.js
node backend/multi-container/three-opt/src/server.js
node backend/single-container/dynamic-programming/src/server.js
node backend/single-container/cheapest-insertion/src/server.js
node backend/single-container/nearest-neighbour/src/server.js
node frontend/web-app/src/server.js
```

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

## Local Testing vs. Distributed Deployment

### Local (Development)
- Run integration tests directly (no service required)
- Single machine execution
- Best for algorithm validation and development

### Distributed (Kubernetes)
- Multi-container/multi-machine deployment
- Master-worker architecture for Brute Force and Three-Opt
- Scales horizontally across multiple nodes
- Production ready with service mesh

## Environment Variables

Each service supports environment variable configuration for distributed deployment:

- `BRUTE_FORCE_MASTER_URL` - Worker endpoint for brute-force master (default: http://localhost:3031)
- `THREE_OPT_MASTER_URL` - Worker endpoint for three-opt master (default: http://localhost:3041)

## Running with Docker

Build and run individual services:
```bash
docker build -t brute-force-service ./backend/multi-container/brute-force
docker run -p 3030:3030 -p 3031:3031 brute-force-service
```

## Performance Notes

- Brute Force tests may take 10-30 seconds for larger graphs due to factorial time complexity
- Integration tests have 30-second timeouts for computational algorithms
- For graphs with 11+ cities, consider using heuristic algorithms (Three-Opt, Cheapest Insertion, Nearest Neighbour)
