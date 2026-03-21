import { useState, useMemo } from 'react'
import { Plus, Calendar, List } from 'lucide-react'
import type { ClassesProps } from '../types'
import { ClassesCalendar } from './ClassesCalendar'
import { ClassesList } from './ClassesList'
import { ClassesFilterBar } from './ClassesFilterBar'

export function ClassesView({
  classes,
  teachers,
  students,
  instruments,
  attendanceRecords,
  teacherAvailability,
  studentAvailability,
  onViewClass,
  onCreateClass,
  onEditClass,
  onRescheduleClass,
  onCancelClass,
  onMarkAttendance,
}: ClassesProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

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

  const scheduledCount = classes.filter((c) => c.status === 'scheduled').length
  const groupCount = classes.filter((c) => c.type === 'group').length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Classes
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {scheduledCount} scheduled classes, {groupCount} group classes
            </p>
          </div>
          <button
            onClick={onCreateClass}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            New Class
          </button>
        </div>

        {/* Toolbar: View toggle + Filters */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>

          {/* Filters */}
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
        </div>

        {/* Results count when filtered */}
        {(selectedTeacher || selectedStudent || selectedInstrument || selectedDay) && (
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredClasses.length} of {classes.length} classes
          </p>
        )}

        {/* View content */}
        {viewMode === 'calendar' ? (
          <ClassesCalendar
            classes={filteredClasses}
            teachers={teachers}
            students={students}
            instruments={instruments}
            onViewClass={onViewClass}
          />
        ) : (
          <ClassesList
            classes={filteredClasses}
            teachers={teachers}
            students={students}
            instruments={instruments}
            onViewClass={onViewClass}
            onEditClass={onEditClass}
            onRescheduleClass={onRescheduleClass}
            onCancelClass={onCancelClass}
          />
        )}
      </div>
    </div>
  )
}
