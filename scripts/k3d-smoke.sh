#!/usr/bin/env bash
set -euo pipefail

context=k3d-tsp
port=18080
graph_index=7

kubectl --context "$context" port-forward svc/tsp-web-app "$port":8080 >/dev/null &
trap 'kill $!' EXIT
until curl -sf "localhost:$port/health" >/dev/null; do sleep 1; done

for algorithm in nearest-neighbour cheapest-insertion dynamic-programming brute-force three-opt; do
  id=$(curl -sf -F graphIndex="$graph_index" -F algorithm="$algorithm" "localhost:$port/test" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
  curl -sf "localhost:$port/result?id=$id" | grep -q '"ActualCost"'
  echo "$algorithm ok"
done
