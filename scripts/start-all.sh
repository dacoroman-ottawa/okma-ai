#!/bin/bash

# Start all services: PostgreSQL, backend, and frontend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Starting Kanata Music Academy ==="
echo ""

# Start database
echo "1. Starting PostgreSQL..."
"$SCRIPT_DIR/start-db.sh"
echo ""

# Start backend
echo "2. Starting backend..."
"$SCRIPT_DIR/start-backend.sh"
echo ""

# Start frontend
echo "3. Starting frontend..."
"$SCRIPT_DIR/start-frontend.sh"
echo ""

echo "=== All services started ==="
echo ""
echo "Run ./scripts/stop-all.sh to stop all services"
