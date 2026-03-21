#!/bin/bash

# Start the FastAPI backend server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Check if already running
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "Backend server is already running on port 8000"
    exit 0
fi

echo "Starting FastAPI backend server..."

uvicorn backend.main:app --reload > /dev/null 2>&1 &
PID=$!

sleep 2

if kill -0 $PID 2>/dev/null; then
    echo "Backend server started (PID: $PID)"
    echo "API: http://localhost:8000"
    echo "Docs: http://localhost:8000/docs"
else
    echo "Failed to start backend server"
    exit 1
fi
