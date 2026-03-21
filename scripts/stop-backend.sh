#!/bin/bash

# Stop the FastAPI backend server

echo "Stopping FastAPI backend server..."

# Find and kill process on port 8000
PID=$(lsof -ti:8000 2>/dev/null)

if [ -n "$PID" ]; then
    kill $PID 2>/dev/null
    echo "Backend server stopped (PID: $PID)"
else
    echo "Backend server is not running"
fi
