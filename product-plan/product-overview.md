# KanataMusicAcademy — Product Overview

## Summary

A comprehensive management system for music schools that helps administrators coordinate teachers, students, scheduling, inventory, and payments in one unified platform.

## Problems Solved

1. **Scheduling Complexity** — Visual availability tracking for teachers and students with conflict-free class enrollment for both private lessons and group classes.

2. **Inventory Chaos** — Centralized tracking of all products (instruments, accessories, books, apparel) with rental and sales management.

3. **Payment Tracking Headaches** — Credit-based system where students purchase credits upfront and balances are automatically deducted as lessons are taken.

4. **Scattered Information** — Single source of truth for student enrollments, teacher assignments, and account balances.

## Planned Sections

1. **People** — Teacher and student profiles with availability calendars and contact information.
2. **Classes** — Class scheduling and enrollment management for both private lessons and group classes.
3. **Payments** — Credit purchases, balance tracking, and lesson payment deductions.
4. **Inventory** — Product catalog with rental and sales tracking for instruments, accessories, and merchandise.
5. **Dashboard** — At-a-glance overview of schedules, balances, and key metrics for administrators.
6. **User Administration** — Manage application users with roles, active status, and password reset capabilities.

## Data Model

**Core Entities:**
- Teacher — Instructor who teaches lessons with availability slots
- Student — Learner who enrolls in classes with a credit balance
- Instrument — Musical instrument that can be taught
- Enrollment — Links a student, teacher, and instrument
- Class — Scheduled lesson (private or group)
- Product — Inventory item (instrument, accessory, book, etc.)
- Rental — Product rental record with period and status
- Sale — Product sale record
- CreditTransaction — Credit purchase or deduction
- AppUser — System login account with admin privileges

## Design System

**Colors:**
- Primary: `indigo` — Buttons, links, key accents
- Secondary: `amber` — Tags, highlights, secondary elements
- Neutral: `slate` — Backgrounds, text, borders

**Typography:**
- Heading: DM Sans
- Body: DM Sans
- Mono: JetBrains Mono

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing, and application shell
2. **People** — Teacher and student profiles with availability
3. **Classes** — Class scheduling and calendar view
4. **Payments** — Credit purchases and balance tracking
5. **Inventory** — Product catalog, rentals, sales, suppliers, customers
6. **Dashboard** — Overview metrics and alerts
7. **User Administration** — App user management

Each milestone has a dedicated instruction document in `product-plan/instructions/`.
