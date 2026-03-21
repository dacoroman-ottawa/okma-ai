#!/bin/bash

# Stop PostgreSQL database server

set -e

echo "Stopping PostgreSQL..."

# Try to stop PostgreSQL via Homebrew services
if command -v brew &> /dev/null; then
    brew services stop postgresql@16 2>/dev/null || \
    brew services stop postgresql@15 2>/dev/null || \
    brew services stop postgresql@14 2>/dev/null || \
    brew services stop postgresql 2>/dev/null || {
        echo "PostgreSQL was not running via Homebrew services"
        exit 0
    }
    echo "PostgreSQL stopped"
else
    echo "Homebrew not found. Please stop PostgreSQL manually."
    exit 1
fi
