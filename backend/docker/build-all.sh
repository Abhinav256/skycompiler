#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
for lang in python c cpp java node; do
  echo "Building skycompiler-$lang..."
  docker build -t "skycompiler-$lang:latest" "./$lang"
done
echo "All images built. Set DOCKER_MODE=true in .env and restart the server."
