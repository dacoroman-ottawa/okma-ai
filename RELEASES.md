# Release Notes

## 2026-04-25 - Docker Orchestration

Added Docker container orchestration for local and remote deployment.

### New Files

- `docker-compose.yml` - Orchestrates PostgreSQL, FastAPI backend, and Next.js frontend containers
- `.env.docker` - Template environment file with configuration variables
- `DOCKER.md` - Documentation for Docker architecture and usage

### Modified Files

- `backend/database.py` - Reads `DATABASE_URL` from environment variable with local development fallback
- `backend/Dockerfile` - Runs backend as a Python package to support relative imports
- `frontend/Dockerfile` - Accepts `NEXT_PUBLIC_API_URL` as build argument for API proxy configuration
- `.gitignore` - Added `pgdata/` and `.env.docker` to ignored files

### TypeScript Fixes (for production build)

- `frontend/src/types/people.ts` - Made `availability` and `instrumentsTaught` optional on Student/Teacher types
- `frontend/src/types/classes.ts` - Made `instrumentsTaught` optional in teacher type definitions
- `frontend/src/components/classes/NewClassModal.tsx` - Fixed optional `instrumentsTaught` and `notes` types
- `frontend/src/components/people/TeachersList.tsx` - Added optional chaining for `instrumentsTaught`
- `frontend/src/app/reset-password/page.tsx` - Wrapped `useSearchParams` in Suspense boundary

### Container Architecture

| Container | Port | Purpose |
|-----------|------|---------|
| db | 5432 (internal) | PostgreSQL database with persistent volume |
| backend | 8000 | FastAPI REST API |
| frontend | 3000 | Next.js web application |

### Usage

```bash
# Setup
cp .env.docker .env
# Edit .env with secure credentials

# Start
docker-compose up -d --build

# Access
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# For remote access, replace localhost with your server's IP address.
```
