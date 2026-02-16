// =============================================================================
// Data Types
// =============================================================================

export type Weekday =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export type Duration = 30 | 45 | 60

export type Frequency = 1 | 2

export type ClassStatus = 'scheduled' | 'cancelled'

export type ClassType = 'private' | 'group'

export interface Class {
  id: string
  teacherId: string
  instrumentId: string
  studentIds: string[]
  type: ClassType
  weekday: Weekday
  startTime: string
  duration: Duration
  frequency: Frequency
  status: ClassStatus
  notes: string | null
}

export interface AttendanceRecord {
  id: string
  classId: string
  studentId: string
  date: string
  attended: boolean
}

// Re-export types from People section for convenience
export type { Teacher, Student, Instrument, AvailabilitySlot } from '../people/types'

// =============================================================================
// Component Props
// =============================================================================

export interface ClassesCalendarViewProps {
  /** List of classes to display */
  classes: Class[]
  /** Teachers for resolving names */
  teachers: Array<{ id: string; name: string; instrumentsTaught: string[] }>
  /** Students for resolving names */
  students: Array<{ id: string; name: string }>
  /** Instruments for resolving names */
  instruments: Array<{ id: string; name: string }>
  /** Attendance records for tracking */
  attendanceRecords: AttendanceRecord[]
  /** Teacher availability for conflict highlighting */
  teacherAvailability: Record<string, Array<{ day: Weekday; startTime: string; endTime: string }>>
  /** Student availability for conflict highlighting */
  studentAvailability: Record<string, Array<{ day: Weekday; startTime: string; endTime: string }>>
  /** Current view mode */
  viewMode: 'calendar' | 'list'
  /** Called when user wants to switch view mode */
  onViewModeChange?: (mode: 'calendar' | 'list') => void
  /** Called when user wants to view a class's details */
  onViewClass?: (id: string) => void
  /** Called when user wants to create a new class */
  onCreateClass?: () => void
  /** Called when user wants to edit a class */
  onEditClass?: (id: string) => void
  /** Called when user wants to reschedule a class */
  onRescheduleClass?: (id: string) => void
  /** Called when user wants to cancel a class */
  onCancelClass?: (id: string) => void
  /** Called when user wants to mark attendance */
  onMarkAttendance?: (classId: string, studentId: string, date: string, attended: boolean) => void
}

export interface ClassesListViewProps {
  /** List of classes to display */
  classes: Class[]
  /** Teachers for resolving names */
  teachers: Array<{ id: string; name: string; instrumentsTaught: string[] }>
  /** Students for resolving names */
  students: Array<{ id: string; name: string }>
  /** Instruments for resolving names */
  instruments: Array<{ id: string; name: string }>
  /** Attendance records for tracking */
  attendanceRecords: AttendanceRecord[]
  /** Called when user wants to view a class's details */
  onViewClass?: (id: string) => void
  /** Called when user wants to create a new class */
  onCreateClass?: () => void
  /** Called when user wants to edit a class */
  onEditClass?: (id: string) => void
  /** Called when user wants to reschedule a class */
  onRescheduleClass?: (id: string) => void
  /** Called when user wants to cancel a class */
  onCancelClass?: (id: string) => void
}

export interface ClassFormProps {
  /** Existing class data if editing */
  existingClass?: Class
  /** Available teachers */
  teachers: Array<{ id: string; name: string; instrumentsTaught: string[] }>
  /** Available students */
  students: Array<{ id: string; name: string }>
  /** Available instruments */
  instruments: Array<{ id: string; name: string }>
  /** Teacher availability for scheduling */
  teacherAvailability: Record<string, Array<{ day: Weekday; startTime: string; endTime: string }>>
  /** Student availability for scheduling */
  studentAvailability: Record<string, Array<{ day: Weekday; startTime: string; endTime: string }>>
  /** Called when form is submitted */
  onSubmit?: (classData: Omit<Class, 'id'>) => void
  /** Called when form is cancelled */
  onCancel?: () => void
}

export interface ClassesProps {
  /** List of classes */
  classes: Class[]
  /** Teachers for resolving names */
  teachers: Array<{ id: string; name: string; instrumentsTaught: string[] }>
  /** Students for resolving names */
  students: Array<{ id: string; name: string }>
  /** Instruments for resolving names */
  instruments: Array<{ id: string; name: string }>
  /** Attendance records */
  attendanceRecords: AttendanceRecord[]
  /** Teacher availability */
  teacherAvailability: Record<string, Array<{ day: Weekday; startTime: string; endTime: string }>>
  /** Student availability */
  studentAvailability: Record<string, Array<{ day: Weekday; startTime: string; endTime: string }>>
  /** Called when user wants to view a class's details */
  onViewClass?: (id: string) => void
  /** Called when user wants to create a new class */
  onCreateClass?: () => void
  /** Called when user wants to edit a class */
  onEditClass?: (id: string) => void
  /** Called when user wants to reschedule a class */
  onRescheduleClass?: (id: string) => void
  /** Called when user wants to cancel a class */
  onCancelClass?: (id: string) => void
  /** Called when user wants to mark attendance */
  onMarkAttendance?: (classId: string, studentId: string, date: string, attended: boolean) => void
}
