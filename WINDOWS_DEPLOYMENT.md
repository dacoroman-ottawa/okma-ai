# Windows Deployment Guide (Docker + WSL2)

This guide explains how to deploy KanataMusicAcademy on a Windows PC using Docker Desktop
with the WSL2 backend.

The images are **built from source on the PC itself**. For a single machine this is the
simplest option: no registry account, no image publishing step, and no architecture
mismatch to reason about. `docker-compose.prod.yml` (pre-built images from Docker Hub)
exists for multi-machine setups and is not used here - see `DEPLOYMENT.md`.

**PostgreSQL does not need to be installed on Windows.** The database runs as the `db`
container (`postgres:16-alpine`) defined in `docker-compose.yml`.

## Prerequisites

- **Docker Desktop** with the WSL2 backend:
  - Settings -> General -> "Use the WSL 2 based engine"
  - Settings -> Resources -> WSL Integration -> enable your distro (e.g. Ubuntu)
- A WSL distro (Ubuntu recommended)
- Internet access (to pull base images)

Run **all commands below from the WSL terminal**, not PowerShell (PowerShell steps are
marked explicitly).

Verify the toolchain:

```bash
docker --version && docker compose version
```

## 1. Get the code

Keep the repository in the **Linux filesystem** (`~/okma-ai`), not `/mnt/c/...`. Building
Next.js on `/mnt/c` is slow, and Windows CRLF line endings can break container entrypoints.

```bash
cd ~
git clone https://github.com/dacoroman-ottawa/okma-ai.git
cd okma-ai
git checkout develop
```

## 2. Create the `.env` file

`docker-compose.yml` declares `${POSTGRES_PASSWORD:?...}` and `${SECRET_KEY:?...}`, so
Docker Compose **aborts before starting anything** if these are missing. A missing `.env`
is the most common reason a deployment ends up with no database running.

```bash
cat > .env << EOF
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -hex 16)
POSTGRES_DB=kanata_academy

# Backend
SECRET_KEY=$(openssl rand -hex 32)

# Initial admin user (created automatically on first startup)
ADMIN_EMAIL=admin@kanatamusic.com
ADMIN_PASSWORD=ChangeMe123!
EOF

cat .env   # record these values somewhere safe
```

`ADMIN_EMAIL` / `ADMIN_PASSWORD` seed the first login - see step 4.

## 3. Build and start the stack

```bash
docker compose up -d --build
```

The first build takes several minutes - it compiles the backend dependencies and runs the
Next.js production build. Subsequent builds reuse Docker's layer cache and are much faster.

Startup order is enforced by health checks: `db` -> `backend` -> `frontend`.

```bash
docker compose ps        # all three services should report "healthy"
docker compose logs -f   # Ctrl-C to detach
```

## 4. The first admin user

`backend/main.py` calls `init_db()` (tables) and then `bootstrap_admin()`, which creates
an ADMIN account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on startup. With step 2 done there
is nothing to run here - the account exists as soon as the backend is healthy.

This matters because there is no public registration endpoint: creating users requires an
existing admin (`backend/routes/users.py:14`), so a database with no admin cannot be
logged into at all.

Confirm it was created:

```bash
docker compose logs backend | grep "initial admin"
# Created initial admin user: admin@kanatamusic.com
```

**Change the password after the first login.** The bootstrap is idempotent and only ever
creates a missing account - editing `ADMIN_PASSWORD` later has no effect on an account
that already exists.

If you left the admin variables out of `.env`, add them and restart the backend:

```bash
docker compose up -d backend
```

### Alternative: seed demo data instead of an empty database

`python -m backend.seed_db` populates teachers, students and classes. The fixtures are
bundled in the image, so no mounts are needed. The script **drops every table first** -
only run it on a fresh install.

```bash
docker compose exec backend python -m backend.seed_db
```

This creates `admin@kanatamusic.com` / `admin123`. Change that password immediately.

## 5. Verify the deployment

```bash
curl http://localhost:8000/
# {"message":"Welcome to KanataMusicAcademy API"}

curl -s -X POST http://localhost:8000/token \
  -d "username=admin@kanatamusic.com&password=ChangeMe123!"
# should return an access_token
```

Then open <http://localhost:3000> in a Windows browser. Docker Desktop forwards WSL ports
to the Windows host automatically.

| Service     | URL                   | Notes                                    |
|-------------|-----------------------|------------------------------------------|
| Frontend    | http://localhost:3000 | Web UI                                   |
| Backend API | http://localhost:8000 | REST API                                 |
| PostgreSQL  | localhost:5433        | Container port 5432 mapped to host 5433  |

`/` redirects to `/login` when you are not signed in - that is expected.

The browser only ever talks to port 3000; Next.js rewrites `/api/*` to
`http://backend:8000` over the Docker network (`frontend/next.config.ts`).

## 6. Access from other machines on the network

Allow inbound traffic through Windows Defender Firewall. In an **elevated PowerShell**:

```powershell
New-NetFirewallRule -DisplayName "OKMA Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "OKMA Backend"  -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

Find the PC's address with `ipconfig` (PowerShell) and browse to
`http://<windows-pc-ip>:3000`. Port 8000 is only needed for direct API access.

## 7. Survive reboots

All services use `restart: unless-stopped`, so only Docker Desktop itself needs to start
automatically: Settings -> General -> "Start Docker Desktop when you log in".

## 8. Backup and restore

Database data lives in the named Docker volume `okma-pgdata`, which survives container
restarts, rebuilds and image updates.

```bash
# Backup
docker exec okma-db pg_dump -U postgres kanata_academy > backup_$(date +%F).sql

# Restore
cat backup_2026-09-30.sql | docker exec -i okma-db psql -U postgres kanata_academy
```

## 9. Updating

Pull the latest code and rebuild in place. The database volume is untouched.

```bash
git pull
docker compose up -d --build
```

Both images are rebuilt, but unchanged layers come from cache, and only containers whose
image actually changed are recreated. To rebuild a single service:

```bash
docker compose up -d --build backend
```

## Common commands

```bash
docker compose ps                  # status
docker compose logs -f backend     # follow logs for one service
docker compose restart frontend    # restart a service
docker compose down                # stop everything (data preserved)
docker compose down -v             # stop and DELETE the database volume
```

## Troubleshooting

**`error while interpolating ... POSTGRES_PASSWORD: Database password required`**
The `.env` file is missing or incomplete. See step 2. It must sit in the same directory as
`docker-compose.yml`.

**Backend is `unhealthy` / restarting**
Check the database came up first:

```bash
docker compose ps db
docker compose logs backend
```

**Login always returns 401**
The admin user was never created - `ADMIN_EMAIL` / `ADMIN_PASSWORD` were missing from
`.env` when the backend first started. Add them and run `docker compose up -d backend`.

**Frontend loads but all API calls fail**
The frontend proxies `/api/*` to `http://backend:8000` over the Docker network. Confirm the
backend container is healthy and on the same network:

```bash
docker compose ps
docker exec okma-frontend node -e "require('http').get('http://backend:8000/', r => console.log(r.statusCode))"
```

**Port already in use (3000, 8000 or 5433)**
Another Windows process holds the port. Find it in PowerShell with
`netstat -ano | findstr :3000`, or change the host-side port mapping in
`docker-compose.yml`.

**Slow builds or file permission errors**
The repository is probably under `/mnt/c/...`. Move it into the WSL home directory
(`~/okma-ai`) and clone again.

**Build fails partway through**
Retry with a clean cache for the affected service:

```bash
docker compose build --no-cache frontend
docker compose up -d
```

**Reset everything (WARNING: deletes all data)**

```bash
docker compose down -v
docker compose up -d --build
```

The admin user is recreated automatically from `.env`.
