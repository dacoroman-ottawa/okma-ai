#!/bin/bash

# Stop all services: frontend, backend, and PostgreSQL

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Stopping Kanata Music Academy ==="
echo ""

# Stop frontend
echo "1. Stopping frontend..."
"$SCRIPT_DIR/stop-frontend.sh"
echo ""

# Stop backend
echo "2. Stopping backend..."
"$SCRIPT_DIR/stop-backend.sh"
echo ""

# Stop database
echo "3. Stopping PostgreSQL..."
"$SCRIPT_DIR/stop-db.sh"
echo ""

echo "=== All services stopped ==="
