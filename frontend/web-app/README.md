
# Frontend Web App

Web interface and test orchestrator for the TSP services, built with React.

## Prerequisites

```bash
npm install
```

## Running

```bash
npm start
```

The Express server serves both the React frontend and API endpoints. By default, it listens on **Port 8080**.

Access at: `http://localhost:8080`

## Environment Variables

- `PORT` - Port the server listens on (default: `8080`)
- `NEAREST_NEIGHBOUR_URL` - Nearest-neighbour service (default: `http://localhost:3000/solve`)
- `CHEAPEST_INSERTION_URL` - Cheapest-insertion service (default: `http://localhost:3010/solve`)
- `DYNAMIC_PROGRAMMING_URL` - Dynamic-programming service (default: `http://localhost:3020/solve`)
- `BRUTE_FORCE_URL` - Brute-force master (default: `http://localhost:3030`)
- `THREE_OPT_URL` - Three-opt master (default: `http://localhost:3040`)

## Features

- **React Web UI** for graph visualization and algorithm selection
- **API integration** with backend services for algorithm execution
- **Accuracy reporting** as the expected cost of the graph divided by the cost found

## Backend Requirements

- Backend services must expose API endpoints for graph data and algorithm execution
- All backend services must be running for full functionality

## Docker


```bash
# Build the image (local)
docker build -t ghcr.io/jadamsx/containerised-tsp/web-app:latest .

# Or pull the latest image from GitHub Container Registry
docker pull ghcr.io/jadamsx/containerised-tsp/web-app:latest

# Run the container
docker run -p 8080:8080 ghcr.io/jadamsx/containerised-tsp/web-app:latest
```

```bash
docker pull ghcr.io/jadamsx/containerised-tsp/web-app:v0.0.1
docker run -p 8080:8080 ghcr.io/jadamsx/containerised-tsp/web-app:v0.0.1
```

Requires backend services to be accessible on the network and ports to be mapped correctly.

## Project Layout

```
frontend/web-app/
├── src/
│   ├── components/
│   │   ├── AlgorithmForm.jsx
│   │   ├── ResultsPage.jsx
│   │   └── TourCanvas.jsx
│   ├── api/
│   │   └── tspService.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   ├── parse-file.cjs
│   ├── run-tests.cjs
│   └── server.cjs
├── package.json
├── Dockerfile
└── README.md
```

## Notes
- This React frontend replaces the previous Express/EJS implementation.
- For development, ensure the backend API endpoints are reachable from the frontend.
