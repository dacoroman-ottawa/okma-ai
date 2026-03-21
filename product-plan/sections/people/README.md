# People Section

Manage teacher and student profiles with contact information, availability schedules, and enrollment details. Teachers and students are accessed via separate sub-pages, each displaying a filterable card grid with drill-down to full profile views.

## User Flows

- View teachers/students as a card grid with name and key info
- Search and filter by name, instrument, active status, and other criteria
- Click a card to open the detail page with full profile
- Add a new teacher or student via modal form
- Edit existing person via modal form
- Set weekly availability using a time slot grid
- View current enrollments (students see their teacher/instrument pairings; teachers see their assigned students)

## UI Requirements

- Separate sub-pages for Teachers and Students under People nav item
- Card grid layout showing name, instrument(s), and active status
- Advanced filter bar with search input and dropdown filters
- Detail page with profile section, availability grid, and enrollments list
- Modal forms for add/edit with field validation
- Weekly availability grid (days x time slots)
- Teacher cards show specialization and instruments taught
- Student cards show skill levels by instrument

## Components

| Component | Description |
|-----------|-------------|
| `TeachersList` | Main view for teachers with grid layout, filters, and add button |
| `TeacherCard` | Card displaying teacher summary (name, specialization, instruments, hourly rate) |
| `TeacherDetail` | Full teacher profile with contact info, employment details, availability grid, and assigned students |
| `StudentsList` | Main view for students with grid layout, filters, and add button |
| `StudentCard` | Card displaying student summary (name, age, skill levels by instrument) |
| `StudentDetail` | Full student profile with contact info, availability grid, and current enrollments |
| `AvailabilityGrid` | Weekly time slot grid showing availability (Mon-Sun, 8AM-8PM) |
| `FilterBar` | Reusable filter component with search input, instrument dropdown, and active/inactive toggle |

## Data Types

See `types.ts` for TypeScript interfaces:

- `Teacher` - Teacher profile with qualifications, specialization, hourly rate
- `Student` - Student profile with skill levels by instrument
- `Instrument` - Musical instrument reference
- `Enrollment` - Links students to teachers for specific instruments
- `AvailabilitySlot` - Weekly recurring time slot
- `SkillLevel` - Student's proficiency level for an instrument

## Configuration

This section is designed to work within the application shell navigation.
