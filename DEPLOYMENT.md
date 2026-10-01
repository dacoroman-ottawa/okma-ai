# Production Deployment Guide

This guide explains how to deploy KanataMusicAcademy using pre-built Docker images from Docker Hub.

> **Status: the published images are out of date.** `dacoroman/okma-backend:latest` and
> `dacoroman/okma-frontend:latest` were built on 2026-09-22 and are **linux/arm64 only**,
> so they will not run on an x86_64 host (`no matching manifest for linux/amd64`). They
> also predate the automatic admin bootstrap, the bundled seed fixtures and the frontend
> health-check fix. Until they are republished as multi-arch, deploy by building from
> source with `docker-compose.yml` - see **WINDOWS_DEPLOYMENT.md** for a full walkthrough.
>
> For a single deployment target, building from source is the recommended approach
> regardless: no registry account, no publishing step, no architecture mismatch.

## Prerequisites

- Docker and Docker Compose installed
- Access to the internet (to pull images)

## Publishing updated images

If you do need the Hub images, build them on a host matching the deployment target (or
cross-build with `buildx`) and push both architectures:

```bash
docker login -u dacoroman
docker buildx create --name okma --driver docker-container --use --bootstrap

VERSION=v1.1.0
docker buildx build --platform linux/amd64,linux/arm64 \
  -t dacoroman/okma-backend:$VERSION -t dacoroman/okma-backend:latest \
  --push ./backend
docker buildx build --platform linux/amd64,linux/arm64 \
  --build-arg INTERNAL_API_URL=http://backend:8000 \
  -t dacoroman/okma-frontend:$VERSION -t dacoroman/okma-frontend:latest \
  --push ./frontend

docker buildx imagetools inspect dacoroman/okma-backend:latest   # verify both platforms
```

Tag a version alongside `latest`: the compose file pins `:latest`, so an untagged push
leaves no way to roll back. Cross-building amd64 on Apple Silicon runs under QEMU and is
slow for the Next.js build and the backend's native dependencies.

## Docker Hub Images

- `dacoroman/okma-frontend:latest` - Next.js frontend
- `dacoroman/okma-backend:latest` - FastAPI backend
- `postgres:16-alpine` - PostgreSQL database

## Deployment Steps

### 1. Create project directory

```bash
mkdir okma-deploy && cd okma-deploy
```

### 2. Download the production compose file

```bash
curl -O https://raw.githubusercontent.com/dacoroman-ottawa/okma-ai/develop/docker-compose.prod.yml
```

Or clone the full repository:

```bash
git clone https://github.com/dacoroman-ottawa/okma-ai.git
cd okma-ai
```

### 3. Create environment file

Create a `.env` file with your configuration:

```bash
cat > .env << 'EOF'
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=kanata_academy

# Backend
SECRET_KEY=your_jwt_secret_key_here

# Initial admin user (created on first backend startup)
ADMIN_EMAIL=admin@kanatamusic.com
ADMIN_PASSWORD=change_me_on_first_login
EOF
```

`ADMIN_EMAIL` / `ADMIN_PASSWORD` create the first ADMIN account, which is the only way
into a fresh database - user creation otherwise requires an existing admin. The bootstrap
is idempotent and skips an email that already exists. Omit both to skip it entirely.

**Important:** Use strong, unique values for `POSTGRES_PASSWORD` and `SECRET_KEY` in production.

Generate a secure secret key:

```bash
openssl rand -hex 32
```

### 4. Pull and start services

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 5. Verify deployment

Check that all containers are running:

```bash
docker compose -f docker-compose.prod.yml ps
```

All services should show as "healthy".

## Access Points

| Service  | URL                    | Description          |
|----------|------------------------|----------------------|
| Frontend | http://localhost:3000  | Web UI               |
| Backend  | http://localhost:8000  | REST API             |
| Database | localhost:5433         | PostgreSQL (internal)|

## Common Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop services
docker compose -f docker-compose.prod.yml down

# Restart a service
docker compose -f docker-compose.prod.yml restart frontend

# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Update to latest images
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## Data Persistence

PostgreSQL data is stored in a named Docker volume `okma-pgdata`. This survives container restarts and updates.

**View volume:**

```bash
docker volume inspect okma-ai_okma-pgdata
```

**Backup database:**

```bash
docker exec okma-db pg_dump -U postgres kanata_academy > backup.sql
```

**Restore database:**

```bash
cat backup.sql | docker exec -i okma-db psql -U postgres kanata_academy
```

## Updating Images

When new versions are available:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

**Container won't start:**

```bash
docker compose -f docker-compose.prod.yml logs <service-name>
```

**Database connection issues:**

Ensure the database is healthy before backend starts:

```bash
docker compose -f docker-compose.prod.yml ps db
```

**Reset everything (WARNING: deletes data):**

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```
