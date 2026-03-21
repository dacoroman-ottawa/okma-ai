#!/bin/bash

# Stop the Next.js frontend development server

echo "Stopping Next.js frontend server..."

# Find and kill process on port 3000
PID=$(lsof -ti:3000 2>/dev/null)

if [ -n "$PID" ]; then
    kill $PID 2>/dev/null
    echo "Frontend server stopped (PID: $PID)"
else
    echo "Frontend server is not running"
fi
