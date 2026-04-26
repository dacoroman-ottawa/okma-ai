# Docker Orchestration Plan

This document describes the Docker container orchestration for KanataMusicAcademy.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Network                           │
│                        (okma-network)                           │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  PostgreSQL │    │   Backend   │    │      Frontend       │  │
│  │   (db)      │◄───│  (backend)  │◄───│     (frontend)      │  │
│  │  Port 5432  │    │  Port 8000  │    │     Port 3000       │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│        │                   │                    │               │
│        ▼                   ▼                    ▼               │
│   ./pgdata            Internal            Exposed: 0.0.0.0      │
│   (volume)            Only                 :3000 + :8000        │
└─────────────────────────────────────────────────────────────────┘
```

## Containers

### 1. PostgreSQL Database (`db`)

| Property | Value |
|----------|-------|
| Image | `postgres:16-alpine` |
| Internal Port | 5432 |
| External Port | Not exposed (internal only) |
| Volume | `./pgdata:/var/lib/postgresql/data` |
| Health Check | `pg_isready -U postgres` |

**Environment Variables:**
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=<secure_password>`
- `POSTGRES_DB=kanata_academy`

**Purpose:** Persistent PostgreSQL database with data stored on local filesystem via mounted volume.

### 2. Backend (`backend`)

| Property | Value |
|----------|-------|
| Build Context | `./backend` |
| Dockerfile | `backend/Dockerfile` |
| Internal Port | 8000 |
| External Port | 8000 (for remote API access) |
| Depends On | `db` (healthy) |

**Environment Variables:**
- `DATABASE_URL=postgresql://postgres:<password>@db:5432/kanata_academy`
- `SECRET_KEY=<jwt_secret_key>`
- `PORT=8000`

**Purpose:** FastAPI application serving the REST API. Connects to PostgreSQL via Docker network using hostname `db`.

### 3. Frontend (`frontend`)

| Property | Value |
|----------|-------|
| Build Context | `./frontend` |
| Dockerfile | `frontend/Dockerfile` |
| Internal Port | 3000 |
| External Port | 3000 (0.0.0.0 for remote access) |
| Depends On | `backend` (healthy) |

**Environment Variables:**
- `NEXT_PUBLIC_API_URL=http://backend:8000`
- `PORT=3000`

**Purpose:** Next.js application serving the web UI. Proxies API requests to backend via Docker network.

## Files to Create/Modify

### New Files

| File | Description |
|------|-------------|
| `docker-compose.yml` | Main orchestration file defining all services |
| `.env.docker` | Environment variables for Docker deployment |

### Files to Modify

| File | Change Required |
|------|-----------------|
| `backend/database.py` | Read `DATABASE_URL` from environment variable instead of hardcoded value |

## Network Configuration

- **Network Name:** `okma-network`
- **Driver:** `bridge`
- **Internal DNS:** Containers communicate via service names (`db`, `backend`, `frontend`)

### Remote Access

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `http://<host>:3000` | Web UI login |
| Backend | `http://<host>:8000` | Direct API access |
| Database | Not exposed | Internal only |

## Volume Configuration

```yaml
volumes:
  pgdata:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./pgdata
```

Data persistence:
- PostgreSQL data stored in `./pgdata` directory
- Survives container restarts and rebuilds
- Easy to backup and migrate

## Startup Order & Health Checks

```
1. db        → Health check: pg_isready
2. backend   → Waits for db, Health check: HTTP GET /
3. frontend  → Waits for backend, Health check: HTTP GET /
```

## Commands

```bash
# Start all services
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild single service
docker-compose build backend
docker-compose up -d backend
```

## Security Considerations

1. **Database:** Not exposed externally, only accessible within Docker network
2. **Secrets:** Use `.env.docker` file (not committed to git) for sensitive values
3. **Frontend:** Runs as non-root user (nextjs:nodejs)
4. **Backend:** Consider adding non-root user in production

## Environment File Template (`.env.docker`)

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me_in_production
POSTGRES_DB=kanata_academy

# Backend
DATABASE_URL=postgresql://postgres:change_me_in_production@db:5432/kanata_academy
SECRET_KEY=generate_a_secure_random_key_here

# Frontend
NEXT_PUBLIC_API_URL=http://backend:8000
```
