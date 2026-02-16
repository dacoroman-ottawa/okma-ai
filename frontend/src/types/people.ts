// =============================================================================
// Data Types
// =============================================================================

export interface Instrument {
  id: string
  name: string
}

export interface SkillLevel {
  instrumentId: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
}

export interface AvailabilitySlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  startTime: string
  endTime: string
}

export type Qualification =
  | 'Bachelor of Music'
  | 'Master'
  | 'Doctorate'
  | 'Professional Certificate'
  | 'Self-Taught Professional'

export interface Teacher {
  id: string
  name: string
  address: string
  email: string
  primaryContact: string
  dateOfBirth: string | null
  active: boolean
  biography: string | null
  specialization: string
  qualification: Qualification
  dateOfEnrollment: string
  socialInsuranceNumber: string
  hourlyRate: number
  instrumentsTaught: string[]
}

export interface Student {
  id: string
  name: string
  address: string
  email: string
  primaryContact: string
  dateOfBirth: string | null
  active: boolean
  skillLevels: SkillLevel[]
}

export interface Enrollment {
  id: string
  studentId: string
  teacherId: string
  instrumentId: string
  startDate: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface TeachersViewProps {
  /** List of teachers to display */
  teachers: Teacher[]
  /** List of instruments for reference */
  instruments: Instrument[]
  /** Availability slots keyed by teacher ID */
  teacherAvailability: Record<string, AvailabilitySlot[]>
  /** Enrollments for showing assigned students */
  enrollments: Enrollment[]
  /** Students for resolving enrollment names */
  students: Student[]
  /** Called when user wants to view a teacher's details */
  onViewTeacher?: (id: string) => void
  /** Called when user wants to add a new teacher */
  onAddTeacher?: () => void
  /** Called when user wants to edit a teacher */
  onEditTeacher?: (id: string) => void
  /** Called when user wants to delete a teacher */
  onDeleteTeacher?: (id: string) => void
  /** Called when user updates a teacher's availability */
  onUpdateAvailability?: (teacherId: string, slots: AvailabilitySlot[]) => void
}

export interface StudentsViewProps {
  /** List of students to display */
  students: Student[]
  /** List of instruments for reference */
  instruments: Instrument[]
  /** Availability slots keyed by student ID */
  studentAvailability: Record<string, AvailabilitySlot[]>
  /** Enrollments for showing teacher/instrument pairings */
  enrollments: Enrollment[]
  /** Teachers for resolving enrollment names */
  teachers: Teacher[]
  /** Called when user wants to view a student's details */
  onViewStudent?: (id: string) => void
  /** Called when user wants to add a new student */
  onAddStudent?: () => void
  /** Called when user wants to edit a student */
  onEditStudent?: (id: string) => void
  /** Called when user wants to delete a student */
  onDeleteStudent?: (id: string) => void
  /** Called when user updates a student's availability */
  onUpdateAvailability?: (studentId: string, slots: AvailabilitySlot[]) => void
}

export interface PeopleProps {
  /** List of teachers */
  teachers: Teacher[]
  /** List of students */
  students: Student[]
  /** List of instruments */
  instruments: Instrument[]
  /** All enrollments */
  enrollments: Enrollment[]
  /** Teacher availability keyed by teacher ID */
  teacherAvailability: Record<string, AvailabilitySlot[]>
  /** Student availability keyed by student ID */
  studentAvailability: Record<string, AvailabilitySlot[]>
  /** Called when navigating to teachers sub-page */
  onNavigateToTeachers?: () => void
  /** Called when navigating to students sub-page */
  onNavigateToStudents?: () => void
  /** Called when user wants to view a teacher's details */
  onViewTeacher?: (id: string) => void
  /** Called when user wants to view a student's details */
  onViewStudent?: (id: string) => void
  /** Called when user wants to add a new teacher */
  onAddTeacher?: () => void
  /** Called when user wants to add a new student */
  onAddStudent?: () => void
  /** Called when user wants to edit a teacher */
  onEditTeacher?: (id: string) => void
  /** Called when user wants to edit a student */
  onEditStudent?: (id: string) => void
  /** Called when user wants to delete a teacher */
  onDeleteTeacher?: (id: string) => void
  /** Called when user wants to delete a student */
  onDeleteStudent?: (id: string) => void
  /** Called when user updates a teacher's availability */
  onUpdateTeacherAvailability?: (teacherId: string, slots: AvailabilitySlot[]) => void
  /** Called when user updates a student's availability */
  onUpdateStudentAvailability?: (studentId: string, slots: AvailabilitySlot[]) => void
}
