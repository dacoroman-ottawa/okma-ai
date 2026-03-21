#!/bin/bash

# Start the Next.js frontend development server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT/frontend"

# Check if already running
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "Frontend server is already running on port 3000"
    exit 0
fi

echo "Starting Next.js frontend server..."

npm run dev > /dev/null 2>&1 &
PID=$!

sleep 3

if kill -0 $PID 2>/dev/null; then
    echo "Frontend server started (PID: $PID)"
    echo "URL: http://localhost:3000"
else
    echo "Failed to start frontend server"
    exit 1
fi
