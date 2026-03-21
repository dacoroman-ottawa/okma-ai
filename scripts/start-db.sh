#!/bin/bash

# Start PostgreSQL database server
# Assumes PostgreSQL is installed via Homebrew

set -e

# Find PostgreSQL installation and add to PATH
PG_PREFIX=""
if command -v brew &> /dev/null; then
    for ver in postgresql@16 postgresql@15 postgresql@14 postgresql; do
        prefix=$(brew --prefix "$ver" 2>/dev/null)
        if [ -n "$prefix" ] && [ -d "$prefix/bin" ]; then
            PG_PREFIX="$prefix"
            break
        fi
    done
fi

if [ -n "$PG_PREFIX" ]; then
    export PATH="$PG_PREFIX/bin:$PATH"
    echo "Found PostgreSQL at: $PG_PREFIX"
else
    echo "Error: PostgreSQL not found. Install with: brew install postgresql@16"
    exit 1
fi

echo "Starting PostgreSQL..."

# Check if PostgreSQL is already running
if pg_isready -q 2>/dev/null; then
    echo "PostgreSQL is already running"
    exit 0
fi

# Try to start PostgreSQL via Homebrew services
if command -v brew &> /dev/null; then
    brew services start postgresql@14 2>/dev/null || \
    brew services start postgresql@15 2>/dev/null || \
    brew services start postgresql@16 2>/dev/null || \
    brew services start postgresql 2>/dev/null || {
        echo "Could not start PostgreSQL via Homebrew services"
        echo "Try starting manually: pg_ctl -D $PG_PREFIX/var/postgres start"
        exit 1
    }
    echo "PostgreSQL started via Homebrew"
else
    echo "Homebrew not found. Please start PostgreSQL manually."
    exit 1
fi

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if pg_isready -q 2>/dev/null; then
        echo "PostgreSQL is ready"
        exit 0
    fi
    sleep 1
done

echo "PostgreSQL failed to start within 30 seconds"
exit 1
