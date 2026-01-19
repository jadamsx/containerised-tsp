
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

## Features

- **React Web UI** for graph visualization and algorithm selection
- **API integration** with backend services for algorithm execution
- **Accuracy reporting** with per-algorithm thresholds:
	- Brute Force: 100%
	- Dynamic Programming: 100%
	- Three-Opt: 97-100%
	- Cheapest Insertion: 50-100%
	- Nearest Neighbour: 50-100%

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

# To use a specific version tag (e.g., v0.0.1):
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
- You may remove optional config files (eslint.config.js, etc.) if not needed, but keep index.html and vite.config.js for Vite/React to work.
