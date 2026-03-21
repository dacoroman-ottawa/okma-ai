import { useState, useMemo } from 'react'
import { Plus, Users } from 'lucide-react'
import type { StudentsViewProps } from '../types'
import { StudentCard } from './StudentCard'
import { FilterBar } from './FilterBar'

export function StudentsList({
  students,
  instruments,
  studentAvailability,
  enrollments,
  teachers,
  onViewStudent,
  onAddStudent,
  onEditStudent,
}: StudentsViewProps) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search filter
      if (
        searchValue &&
        !student.name.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return false
      }

      // Instrument filter - check skill levels
      if (selectedInstrument) {
        const hasInstrument = student.skillLevels.some(
          (skill) => skill.instrumentId === selectedInstrument
        )
        if (!hasInstrument) {
          return false
        }
      }

      // Active filter
      if (activeFilter === 'active' && !student.active) {
        return false
      }
      if (activeFilter === 'inactive' && student.active) {
        return false
      }

      return true
    })
  }, [students, searchValue, selectedInstrument, activeFilter])

  const activeCount = students.filter((s) => s.active).length
  const inactiveCount = students.filter((s) => !s.active).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Students
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeCount} active, {inactiveCount} inactive
            </p>
          </div>
          <button
            onClick={onAddStudent}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            instruments={instruments}
            selectedInstrument={selectedInstrument}
            onInstrumentChange={setSelectedInstrument}
            activeFilter={activeFilter}
            onActiveFilterChange={setActiveFilter}
            placeholder="Search students..."
          />
        </div>

        {/* Results count */}
        {(searchValue || selectedInstrument || activeFilter !== 'all') && (
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        )}

        {/* Student grid */}
        {filteredStudents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                instruments={instruments}
                availability={studentAvailability[student.id] || []}
                onView={() => onViewStudent?.(student.id)}
                onEdit={() => onEditStudent?.(student.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-slate-900 dark:text-slate-100">
              No students found
            </h3>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              {searchValue || selectedInstrument || activeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first student to get started'}
            </p>
            {!searchValue && !selectedInstrument && activeFilter === 'all' && (
              <button
                onClick={onAddStudent}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
