#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

cluster=tsp
context=k3d-$cluster
repository=ghcr.io/jadamsx/containerised-tsp
tag=local

images=(
  "nearest-neighbour backend/single-container/nearest-neighbour"
  "cheapest-insertion backend/single-container/cheapest-insertion"
  "dynamic-programming backend/single-container/dynamic-programming"
  "brute-force backend/multi-container/brute-force"
  "three-opt backend/multi-container/three-opt"
  "web-app frontend/web-app"
)

if ! k3d cluster list "$cluster" >/dev/null 2>&1; then
  k3d cluster create "$cluster" --kubeconfig-switch-context=false
fi

for entry in "${images[@]}"; do
  read -r name dir <<<"$entry"
  docker build -t "$repository/$name:$tag" "$dir"
  k3d image import "$repository/$name:$tag" -c "$cluster"
done

helm upgrade --install tsp deploy/helm/tsp \
  --kube-context "$context" \
  --set image.repository="$repository" \
  --set image.tag="$tag" \
  --set image.pullPolicy=IfNotPresent \
  --wait --timeout 5m
