# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Colors:**
- Primary: `indigo` — buttons, links, key accents
- Secondary: `amber` — tags, highlights, alerts
- Neutral: `slate` — backgrounds, text, borders

**Typography:**
- Heading/Body: DM Sans
- Mono: JetBrains Mono

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/README.md` for entity descriptions
- Core entities: Teacher, Student, Instrument, Enrollment, Class, Product, Rental, Sale, CreditTransaction, AppUser

### 3. Routing Structure

Create placeholder routes for each section:

| Route | Section |
|-------|---------|
| `/` or `/dashboard` | Dashboard |
| `/people` | People (Teachers & Students) |
| `/classes` | Classes |
| `/payments` | Payments |
| `/inventory` | Inventory |
| `/users` | User Administration |

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper with sidebar
- `MainNav.tsx` — Navigation component with icons
- `UserMenu.tsx` — User menu with avatar and logout

**Wire Up Navigation:**

Connect navigation items to your routing:

| Nav Item | Route | Icon |
|----------|-------|------|
| Dashboard | `/dashboard` | LayoutDashboard |
| People | `/people` | Users |
| Classes | `/classes` | Calendar |
| Payments | `/payments` | CreditCard |
| Inventory | `/inventory` | Package |
| Users | `/users` | Shield |

**Note:** You may need to add the Users nav item to MainNav.tsx

**User Menu:**

The user menu expects:
- User name (string)
- Avatar URL (optional)
- Logout callback

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured (fonts loading, colors available)
- [ ] Data model types are defined
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with navigation
- [ ] Navigation links to correct routes
- [ ] User menu shows user info
- [ ] Responsive on mobile (hamburger menu works)
- [ ] Dark mode works
