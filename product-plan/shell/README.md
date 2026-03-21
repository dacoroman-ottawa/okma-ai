# Application Shell Specification

## Overview
A sidebar-based navigation shell for KanataMusicAcademy that provides persistent access to all sections while maximizing content area for administrative tasks.

## Navigation Structure
- Dashboard → Default home view with overview and metrics
- People → Teacher and student profiles
- Classes → Class scheduling and enrollment
- Payments → Credit purchases and balance tracking
- Inventory → Product catalog with rentals and sales

## User Menu
Located at the bottom of the sidebar. Displays user avatar (or initials fallback), user name, and a logout button. Keeps authentication actions accessible but out of the way.

## Layout Pattern
Fixed sidebar navigation (240px width) on the left with main content area filling the remaining space. The sidebar contains the app logo/name at the top, navigation items in the middle, and user menu at the bottom.

## Responsive Behavior
- **Desktop:** Fixed visible sidebar (240px), content area fills remaining width
- **Tablet:** Collapsible sidebar with toggle button in header, content area expands when collapsed
- **Mobile:** Hidden sidebar by default, hamburger menu in header triggers slide-in overlay

## Design Notes
- Active navigation item highlighted with indigo background
- Hover states use subtle indigo tint
- Icons accompany each navigation item for quick recognition
- Smooth transitions for sidebar collapse/expand animations
- Supports light and dark mode
