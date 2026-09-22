# Production Deployment Guide

This guide explains how to deploy KanataMusicAcademy using pre-built Docker images from Docker Hub.

## Prerequisites

- Docker and Docker Compose installed
- Access to the internet (to pull images)

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
EOF
```

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

PostgreSQL data is stored in `./pgdata` directory. This survives container restarts and updates.

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
rm -rf pgdata
docker compose -f docker-compose.prod.yml up -d
```
