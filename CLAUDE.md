# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KanataMusicAcademy is a music school management system with a FastAPI backend and Next.js frontend. It manages teachers, students, class scheduling, payments (credit-based system), and inventory (rentals/sales).

## Commands

### Backend (FastAPI + PostgreSQL)

```bash
# Start backend server (from backend directory)
cd backend && uvicorn main:app --reload

# Run all tests
pytest backend/tests/

# Run single test file
pytest backend/tests/test_classes.py

# Run single test
pytest backend/tests/test_classes.py::test_mark_attendance_deducts_credits -v

# Seed database
python -m backend.seed_db
```

### Frontend (Next.js)

```bash
# Start dev server (from frontend directory)
cd frontend && npm run dev

# Build
cd frontend && npm run build

# Lint
cd frontend && npm run lint
```

## Architecture

### Backend Structure

- **main.py**: FastAPI app entry, CORS config, route mounting, `/token` endpoint for JWT auth
- **models.py**: SQLAlchemy models (Teacher, Student, Class, Enrollment, Product, Rental, Sale, CreditTransaction, AppUser, etc.)
- **database.py**: PostgreSQL connection (`postgresql://@localhost/kanata_academy`)
- **auth.py**: JWT authentication with bcrypt passwords, `get_current_user` dependency, `RoleChecker` for RBAC
- **routes/**: API routers - people.py, classes.py, payments.py, inventory.py, dashboard.py
- **services/**: Business logic services (email.py)
- **tests/**: pytest tests using SQLite in-memory DB, override `get_db` and `get_current_user` for testing

### Frontend Structure

- **src/app/**: Next.js App Router pages, `(dashboard)` route group for main layout
- **src/components/**: Feature components organized by domain (people/, classes/, payments/, inventory/, dashboard/, shell/, ui/)
- **src/hooks/**: Custom React hooks
- **src/types/**: TypeScript type definitions

### Key Patterns

- **RBAC**: Three roles (ADMIN, TEACHER, STUDENT). Admins have full access, teachers see own students/classes, students see own data
- **Credit System**: Students purchase credits via CreditTransaction (type=PURCHASE), credits deducted when attendance marked (type=DEDUCTION)
- **Test Auth Override**: Tests override `get_current_user` with lambda returning mock admin user

### Database

- Production: PostgreSQL (`kanata_academy` database)
- Tests: SQLite (`test.db`, `test_inventory.db`)
- Models use String IDs with prefixes (e.g., `tch-`, `stu-`, `cls-`, `enr-`)

## Product Plan

The `product-plan/` directory contains design specifications from Design OS:
- `product-overview.md`: Product summary and data model
- `instructions/incremental/`: Milestone-based implementation instructions (01-foundation through 07-user-admin)
- `sections/`: Component specifications for each feature area
