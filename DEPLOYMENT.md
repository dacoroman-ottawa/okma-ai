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

# Public URL of the frontend, used to build emailed password reset and
# account activation links
FRONTEND_URL=https://academy.example.com

# Email delivery (for Gmail, SMTP_PASSWORD must be an App Password)
SEND_REAL_EMAILS=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=Kanata Music Academy
EOF
```

`ADMIN_EMAIL` / `ADMIN_PASSWORD` create the first ADMIN account, which is the only way
into a fresh database - user creation otherwise requires an existing admin. The bootstrap
is idempotent and skips an email that already exists. Omit both to skip it entirely.

`FRONTEND_URL` is required by `docker-compose.prod.yml`. It is the base of every link
the backend emails out, so if it is wrong, password reset and account activation links
are broken for every recipient.

`SEND_REAL_EMAILS` is also required by `docker-compose.prod.yml`, and has to be set
explicitly to `true` or `false`. It is not defaulted on purpose: a stack that quietly
falls back to simulation mode reports every email as sent while sending nothing.

The backend image deliberately excludes `backend/.env`, so the `SMTP_*` and
`SEND_REAL_EMAILS` values above must come from this file. In simulation mode messages
are written to the container logs and never sent. The effective configuration is logged
at startup - check it with `docker compose logs backend | grep -i email`. Set
`LOG_LEVEL` (default `INFO`) to change application log verbosity.

**Gmail App Passwords.** With `SMTP_HOST=smtp.gmail.com`, `SMTP_PASSWORD` has to be an
App Password - Gmail stopped accepting account passwords over SMTP in 2022. Generate one
at <https://myaccount.google.com/apppasswords>; the account needs 2-Step Verification
enabled or that page is unavailable. Google shows the 16-character value **once**, and
afterwards the management page lists only each password's name and creation date, so put
it in a password manager at the moment you create it. A lost App Password cannot be
recovered, only revoked and replaced. Turning 2-Step Verification off deletes every App
Password on the account and silently stops delivery.

Rotating the credential needs no rebuild: update `SMTP_PASSWORD` in `.env` and run
`docker compose -f docker-compose.prod.yml up -d backend`.

A personal Gmail account is workable for development but a poor production sender. It is
capped at roughly 500 recipients per day, mail leaves from an individual's address rather
than the academy's, and the credential dies with that individual's account. For a real
deployment prefer a transactional provider (SES, Postmark, Resend) or a Workspace account
with its own credential.

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
