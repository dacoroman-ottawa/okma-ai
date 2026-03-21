import { useState, useMemo } from 'react'
import { Plus, Calendar, List, ClipboardCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Class, ClassType, Weekday, AttendanceRecord, AttendanceStatus } from '@/types/classes'
import { ClassesCalendar } from './ClassesCalendar'
import { ClassesList } from './ClassesList'
import { ClassesFilterBar } from './ClassesFilterBar'
import { AttendanceFilterBar } from './AttendanceFilterBar'
import { NewClassModal } from './NewClassModal'
import { AttendanceListInline } from './AttendanceListInline'
import { AttendanceModal } from '../attendance/AttendanceModal'

interface ClassFormData {
    teacherId: string
    instrumentId: string
    studentIds: string[]
    type: ClassType
    weekday: Weekday
    startTime: string
    duration: number
    frequency: number
    notes?: string
}

type ViewMode = 'schedule-calendar' | 'schedule-list' | 'attendance-list'

interface ClassesViewProps {
    classes: Class[]
    teachers: Array<{ id: string; name: string; instrumentsTaught?: string[] }>
    students: Array<{ id: string; name: string }>
    instruments: Array<{ id: string; name: string }>
    teacherAvailability: Record<string, Array<{ day: Weekday; startTime: string; endTime: string }>>
    studentAvailability: Record<string, Array<{ day: Weekday; startTime: string; endTime: string }>>
    onViewClass?: (id: string) => void
    onRescheduleClass?: (id: string) => void
    onCancelClass?: (id: string) => void
    onMarkAttendance?: (classId: string, studentId: string, date: string, attended: boolean) => void
    onCreateClass?: (data: ClassFormData) => Promise<void>
    onUpdateClass?: (id: string, data: ClassFormData) => Promise<void>
    // Attendance props
    attendanceRecords?: AttendanceRecord[]
    weekStart?: Date
    weekEnd?: Date
    onPreviousWeek?: () => void
    onNextWeek?: () => void
    onCurrentWeek?: () => void
    onUpdateAttendance?: (recordId: string, data: { date?: string; time?: string; status?: AttendanceStatus; remarks?: string }) => Promise<void>
    onCreateAttendance?: (data: { classId: string; studentId: string; date: string; time?: string; status?: AttendanceStatus; remarks?: string }) => Promise<void>
    onDeleteAttendance?: (recordId: string) => Promise<void>
    onGenerateWeek?: () => Promise<void>
}

export function ClassesView({
    classes,
    teachers,
    students,
    instruments,
    teacherAvailability,
    studentAvailability,
    onCreateClass,
    onUpdateClass,
    onViewClass,
    onRescheduleClass,
    onCancelClass,
    // Attendance props
    attendanceRecords = [],
    weekStart = new Date(),
    weekEnd = new Date(),
    onPreviousWeek,
    onNextWeek,
    onCurrentWeek,
    onUpdateAttendance,
    onCreateAttendance,
    onDeleteAttendance,
    onGenerateWeek,
}: ClassesViewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('schedule-calendar')
    const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
    const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null)
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(null)
    const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false)
    const [classToEdit, setClassToEdit] = useState<typeof classes[0] | null>(null)
    const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState<AttendanceRecord | null>(null)
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
    const [attendanceModalMode, setAttendanceModalMode] = useState<'edit' | 'create'>('edit')
    const [generating, setGenerating] = useState(false)

    const handleEditClass = (id: string) => {
        const cls = classes.find(c => c.id === id)
        if (cls) {
            setClassToEdit(cls)
        }
    }

    const handleCloseModal = () => {
        setIsNewClassModalOpen(false)
        setClassToEdit(null)
    }

    // Filter classes based on selected filters
    const filteredClasses = useMemo(() => {
        return classes.filter((classItem) => {
            if (selectedTeacher && classItem.teacherId !== selectedTeacher) {
                return false
            }
            if (selectedStudent && !classItem.studentIds.includes(selectedStudent)) {
                return false
            }
            if (selectedInstrument && classItem.instrumentId !== selectedInstrument) {
                return false
            }
            if (selectedDay && classItem.weekday !== selectedDay) {
                return false
            }
            return true
        })
    }, [classes, selectedTeacher, selectedStudent, selectedInstrument, selectedDay])

    // Filter attendance records
    const filteredAttendanceRecords = useMemo(() => {
        return attendanceRecords.filter((r) => {
            if (selectedTeacher) {
                const cls = classes.find((c) => c.id === r.classId)
                if (cls?.teacherId !== selectedTeacher) return false
            }
            if (selectedStudent && r.studentId !== selectedStudent) return false
            if (selectedStatus && r.status !== selectedStatus) return false
            return true
        })
    }, [attendanceRecords, classes, selectedTeacher, selectedStudent, selectedStatus])

    const totalCount = classes.length
    const groupCount = classes.filter((c) => c.type === 'group').length

    const formatWeekRange = (start: Date, end: Date): string => {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
        const startStr = start.toLocaleDateString('en-US', options)
        const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' })
        return `${startStr} - ${endStr}`
    }

    const handleAttendanceRowClick = (record: AttendanceRecord) => {
        setSelectedAttendanceRecord(record)
        setAttendanceModalMode('edit')
        setIsAttendanceModalOpen(true)
    }

    const handleAddAttendanceEntry = () => {
        setSelectedAttendanceRecord(null)
        setAttendanceModalMode('create')
        setIsAttendanceModalOpen(true)
    }

    const handleGenerateWeek = async () => {
        if (!onGenerateWeek) return
        setGenerating(true)
        try {
            await onGenerateWeek()
        } finally {
            setGenerating(false)
        }
    }

    const handleAttendanceStatusChange = async (recordId: string, status: AttendanceStatus) => {
        if (onUpdateAttendance) {
            await onUpdateAttendance(recordId, { status })
        }
    }

    const handleAttendanceSave = async (data: { date?: string; time?: string; status?: AttendanceStatus; remarks?: string }) => {
        if (selectedAttendanceRecord && onUpdateAttendance) {
            await onUpdateAttendance(selectedAttendanceRecord.id, data)
        }
    }

    const handleAttendanceCreate = async (data: { classId: string; studentId: string; date: string; time?: string; status?: AttendanceStatus; remarks?: string }) => {
        if (onCreateAttendance) {
            await onCreateAttendance(data)
        }
    }

    const isAttendanceView = viewMode === 'attendance-list'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Toolbar: View toggle + Filters */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* View toggle - all three options on one line */}
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                        <button
                            onClick={() => setViewMode('schedule-calendar')}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'schedule-calendar'
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                                }`}
                        >
                            <Calendar className="h-4 w-4" />
                            Schedule Calendar
                        </button>
                        <button
                            onClick={() => setViewMode('schedule-list')}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'schedule-list'
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                                }`}
                        >
                            <List className="h-4 w-4" />
                            Schedule List
                        </button>
                        <button
                            onClick={() => setViewMode('attendance-list')}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'attendance-list'
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                                }`}
                        >
                            <ClipboardCheck className="h-4 w-4" />
                            Attendance List
                        </button>
                    </div>

                    {/* Filters */}
                    {!isAttendanceView ? (
                        <ClassesFilterBar
                            teachers={teachers}
                            students={students}
                            instruments={instruments}
                            selectedTeacher={selectedTeacher}
                            selectedStudent={selectedStudent}
                            selectedInstrument={selectedInstrument}
                            selectedDay={selectedDay}
                            onTeacherChange={setSelectedTeacher}
                            onStudentChange={setSelectedStudent}
                            onInstrumentChange={setSelectedInstrument}
                            onDayChange={setSelectedDay}
                        />
                    ) : (
                        <AttendanceFilterBar
                            teachers={teachers}
                            students={students}
                            selectedTeacher={selectedTeacher}
                            selectedStudent={selectedStudent}
                            selectedStatus={selectedStatus}
                            onTeacherChange={setSelectedTeacher}
                            onStudentChange={setSelectedStudent}
                            onStatusChange={setSelectedStatus}
                        />
                    )}
                </div>

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            Classes
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {totalCount} classes, {groupCount} group classes
                        </p>
                    </div>
                    <button
                        onClick={() => setIsNewClassModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        New Class
                    </button>
                </div>

                {/* Week Navigation for Attendance */}
                {isAttendanceView && (
                    <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                        <button
                            onClick={onPreviousWeek}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {formatWeekRange(weekStart, weekEnd)}
                            </p>
                            <button
                                onClick={onCurrentWeek}
                                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                                Today
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleGenerateWeek}
                                disabled={generating || attendanceRecords.length > 0}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                title={attendanceRecords.length > 0 ? 'Week already has attendance entries' : ''}
                            >
                                {generating ? 'Generating...' : 'Generate Week'}
                            </button>
                            <button
                                onClick={handleAddAttendanceEntry}
                                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                            <button
                                onClick={onNextWeek}
                                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Results count when filtered */}
                {!isAttendanceView && (selectedTeacher || selectedStudent || selectedInstrument || selectedDay) && (
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Showing {filteredClasses.length} of {classes.length} classes
                    </p>
                )}
                {isAttendanceView && (selectedTeacher || selectedStudent || selectedStatus) && (
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Showing {filteredAttendanceRecords.length} of {attendanceRecords.length} records
                    </p>
                )}

                {/* View content */}
                {viewMode === 'schedule-calendar' && (
                    <ClassesCalendar
                        classes={filteredClasses}
                        teachers={teachers}
                        students={students}
                        instruments={instruments}
                        selectedDay={selectedDay}
                        onViewClass={handleEditClass}
                    />
                )}
                {viewMode === 'schedule-list' && (
                    <ClassesList
                        classes={filteredClasses}
                        teachers={teachers}
                        students={students}
                        instruments={instruments}
                        onViewClass={handleEditClass}
                        onEditClass={handleEditClass}
                        onRescheduleClass={onRescheduleClass}
                        onCancelClass={onCancelClass}
                    />
                )}
                {viewMode === 'attendance-list' && (
                    <AttendanceListInline
                        records={filteredAttendanceRecords}
                        classes={classes}
                        teachers={teachers}
                        students={students}
                        instruments={instruments}
                        onStatusChange={handleAttendanceStatusChange}
                        onRowClick={handleAttendanceRowClick}
                        onDelete={onDeleteAttendance}
                    />
                )}
            </div>

            {/* Class Modal (Create/Edit) */}
            {(onCreateClass || onUpdateClass) && (
                <NewClassModal
                    teachers={teachers}
                    students={students}
                    instruments={instruments}
                    teacherAvailability={teacherAvailability}
                    studentAvailability={studentAvailability}
                    existingClasses={classes}
                    isOpen={isNewClassModalOpen || !!classToEdit}
                    onClose={handleCloseModal}
                    onSave={onCreateClass || (async () => {})}
                    classToEdit={classToEdit}
                    onUpdate={onUpdateClass}
                />
            )}

            {/* Attendance Modal */}
            <AttendanceModal
                isOpen={isAttendanceModalOpen}
                record={selectedAttendanceRecord}
                classes={classes}
                teachers={teachers}
                students={students}
                instruments={instruments}
                mode={attendanceModalMode}
                onClose={() => setIsAttendanceModalOpen(false)}
                onSave={handleAttendanceSave}
                onCreate={handleAttendanceCreate}
            />
        </div>
    )
}
