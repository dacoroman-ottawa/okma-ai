# Release Notes

## 2026-04-25 - Docker API URL Fix & Non-Admin Dashboard Access

Fixed Docker build to use correct API URL for browser requests and hid Dashboard from non-admin users.

### Docker API URL Fix

The frontend Docker build was using `http://backend:8000` which only works inside the Docker network. Browsers cannot resolve the `backend` hostname. Fixed to use `http://localhost:8000` by default.

- Fixed template literal syntax in all fetch calls (changed `"${API_BASE_URL}"` to `` `${API_BASE_URL}` ``)
- Updated `docker-compose.yml` default `NEXT_PUBLIC_API_URL` to `http://localhost:8000`
- Updated `frontend/Dockerfile` default `NEXT_PUBLIC_API_URL` to `http://localhost:8000`

### Non-Admin Dashboard Access

- Dashboard is now hidden from non-admin users (only Classes visible in navigation)
- Non-admin users accessing `/` or `/dashboard` are redirected to `/classes`

### Modified Files

- `docker-compose.yml` - Changed default API URL from `http://backend:8000` to `http://localhost:8000`
- `frontend/Dockerfile` - Changed default API URL from `http://backend:8000` to `http://localhost:8000`
- `frontend/src/app/(dashboard)/layout.tsx` - Added Dashboard to admin-only items, added redirect for non-admins

---

## 2026-04-25 - Authentication Fix & Configurable API URL

Fixed authentication to use stored JWT tokens and made backend API URL configurable.

### New Files

- `frontend/src/lib/config.ts` - Exports `API_BASE_URL` from `NEXT_PUBLIC_API_URL` env var

### Authentication Fix

Removed hardcoded admin credentials (`admin@kanatamusic.com` / `admin123`) from all hooks and pages. API calls now use the JWT token stored in localStorage from the logged-in user's session.

### Configurable API URL

Replaced all hardcoded `http://localhost:8000` references with configurable `API_BASE_URL`:
- Defaults to `http://localhost:8000` for local development
- Set `NEXT_PUBLIC_API_URL` environment variable for production deployments

### Modified Files

- `frontend/src/lib/utils.ts` - Added `getAuthToken()`, `getAuthHeaders()`, and re-exports `API_BASE_URL`
- `frontend/src/hooks/useUsers.ts` - Use stored JWT and configurable API URL
- `frontend/src/hooks/useClasses.ts` - Use stored JWT and configurable API URL
- `frontend/src/hooks/usePeople.ts` - Use stored JWT and configurable API URL
- `frontend/src/hooks/usePayments.ts` - Use stored JWT and configurable API URL
- `frontend/src/hooks/useInventory.ts` - Use stored JWT and configurable API URL
- `frontend/src/hooks/useDashboard.ts` - Use stored JWT and configurable API URL
- `frontend/src/app/login/page.tsx` - Use configurable API URL
- `frontend/src/app/reset-password/page.tsx` - Use configurable API URL
- `frontend/src/app/(dashboard)/people/students/[id]/page.tsx` - Use stored JWT and configurable API URL
- `frontend/src/app/(dashboard)/people/teachers/[id]/page.tsx` - Use stored JWT and configurable API URL

### Usage

```bash
# Local development (uses default localhost:8000)
npm run dev

# Production (set the env var)
NEXT_PUBLIC_API_URL=https://api.example.com npm run build
```

---

## 2026-04-25 - View-Only Access for Non-Admin Users

Implemented role-based view-only access for non-admin users (students/teachers with `is_admin=false`).

### New Files

- `frontend/src/contexts/UserContext.tsx` - User context provider exposing `isAdmin` flag across the app

### Features

- **Role-Based Navigation**: Non-admin users see only Classes in navigation (Dashboard, People, Payments, Inventory, Users are hidden)
- **View-Only Schedule**: Non-admin users can view Schedule Calendar, Schedule List, and Attendance List in read-only mode
- **Hidden Admin Controls**: "New Class", "Generate Week", and "Add Attendance" buttons hidden for non-admins
- **Read-Only Lists**: Action menus (Edit/Reschedule/Delete) hidden in Schedule List and Attendance List for non-admins
- **Status Badges**: Attendance status shown as read-only badges instead of editable dropdowns for non-admins

### Modified Files

- `frontend/src/app/(dashboard)/layout.tsx` - Wrapped with UserProvider, filtered navigation by role
- `frontend/src/components/classes/ClassesView.tsx` - Added role-based visibility for admin controls
- `frontend/src/components/classes/ClassesList.tsx` - Added `readOnly` prop to hide action menu
- `frontend/src/components/classes/AttendanceListInline.tsx` - Added `readOnly` prop for view-only mode

### Backend Protection

Backend already enforces RBAC:
- POST/PUT/DELETE for classes require `is_admin`
- Attendance modifications require admin or the class teacher
- GET endpoints filter data by user role (students see only their own schedule)

---

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

---

## 2026-04-09 - GCP Deployment & PDF Export

Added GCP deployment automation and modernized PDF export functionality.

### New Files

- `Makefile.gcp` - GCP deployment automation with targets for build, push, deploy
- `CLAUDE_GCP_ARCHITECTURE.md` - GCP architecture documentation
- `GEMINI_GCP_ARCHITECTURE.md` - Alternative GCP architecture reference
- `backend/Dockerfile` - Backend container configuration
- `frontend/Dockerfile` - Frontend container configuration

### Features

- **PDF Export**: Modernized payment form export with receipt-style layout, styled tables, and summary cards
- **GCP Deployment**: Makefile-based automation for Google Cloud Platform deployment
- **UI Fix**: Enabled scrolling for user cards list in Users tab

### Modified Files

- `frontend/src/components/payments/PaymentsView.tsx` - Receipt-style PDF export
- `frontend/src/components/users/UserAdministrationView.tsx` - Fixed user cards scrolling

---

## 2026-03-22 - Transaction CRUD & Cloud Documentation

Added transaction management and cloud architecture documentation.

### New Files

- `CLAUDE_AWS_ARCHITECTURE.md` - AWS deployment architecture documentation
- `CLAUDE_OCI_ARCHITECTURE.md` - Oracle Cloud Infrastructure architecture documentation
- `scripts/start-all.sh`, `scripts/stop-all.sh` - Combined start/stop scripts
- `scripts/start-db.sh`, `scripts/stop-db.sh` - Database start/stop scripts
- `scripts/start-backend.sh`, `scripts/stop-backend.sh` - Backend start/stop scripts
- `scripts/start-frontend.sh`, `scripts/stop-frontend.sh` - Frontend start/stop scripts

### Features

- **Transaction CRUD**: Full create/read/update/delete for transactions with 3-dots menu and unified form
- **Sales CRUD**: Full create/read/update/delete for sales with 3-dots menu
- **Search**: Added search functionality to Rentals and Sales tabs
- **Scripts**: Added convenient start/stop scripts for database and servers

### Modified Files

- `frontend/src/components/payments/TransactionList.tsx` - Transaction CRUD operations
- `frontend/src/components/payments/forms/EditTransactionForm.tsx` - Unified transaction form
- `frontend/src/components/inventory/SalesTab.tsx` - Sales CRUD operations
- `frontend/src/components/inventory/SaleFormModal.tsx` - Sales form modal
- `frontend/src/components/inventory/RentalsTab.tsx` - Search functionality
- `backend/routes/payments.py` - Transaction API endpoints
- `backend/routes/inventory.py` - Sales API endpoints

---

## 2026-03-20 - Payments & Rentals Enhancements

Enhanced payments page with filters and improved rental management.

### Features

- **Date Filters**: Added date range filters to payments page
- **Export**: Added export functionality to payments page
- **Rental CRUD**: Full create/read/update/delete for rentals with 3-dots menu
- **Rental Fields**: Added Late Fee, Status, and Return Date fields to Edit Rental form
- **UI Consistency**: Improved inventory and payments UI consistency

### Modified Files

- `frontend/src/components/payments/PaymentsView.tsx` - Date filters and export
- `frontend/src/components/inventory/RentalsTab.tsx` - Rental CRUD operations
- `frontend/src/components/inventory/RentalFormModal.tsx` - Enhanced rental form
- `frontend/src/hooks/useInventory.ts` - Inventory data hooks
- `frontend/src/types/inventory.ts` - Rental type updates
- `backend/routes/inventory.py` - Rental API endpoints

---

## 2026-03-15 - Inventory CRUD & UI Improvements

Added full CRUD operations for inventory management entities.

### Features

- **Customer CRUD**: Create, edit, delete customers with active status toggle
- **Supplier CRUD**: Create, edit, delete suppliers with 3-dots menu and status toggle
- **Product CRUD**: Create, edit, delete products with 3-dots menu
- **Fixed Headers**: Made people and payments page headers fixed with scrollable content
- **Inventory Scrolling**: Fixed inventory tab scrolling issues

### New Files

- `frontend/src/components/inventory/CustomerFormModal.tsx` - Customer form modal
- `frontend/src/components/inventory/SupplierFormModal.tsx` - Supplier form modal
- `frontend/src/components/inventory/ProductFormModal.tsx` - Product form modal

### Modified Files

- `frontend/src/components/inventory/CustomersTab.tsx` - Customer CRUD operations
- `frontend/src/components/inventory/SuppliersTab.tsx` - Supplier CRUD operations
- `frontend/src/components/inventory/ProductsTab.tsx` - Product CRUD operations
- `frontend/src/components/inventory/InventoryView.tsx` - Scrolling fixes
- `frontend/src/components/shell/AppShell.tsx` - Layout improvements
- `frontend/src/types/inventory.ts` - Type definitions
- `backend/routes/inventory.py` - Inventory API endpoints
- `backend/models.py` - Model updates
