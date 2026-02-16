import { useState, useMemo } from 'react'
import { Plus, Users } from 'lucide-react'
import type { TeachersViewProps } from '../types'
import { TeacherCard } from './TeacherCard'
import { FilterBar } from './FilterBar'

export function TeachersList({
  teachers,
  instruments,
  teacherAvailability,
  enrollments,
  students,
  onViewTeacher,
  onAddTeacher,
  onEditTeacher,
}: TeachersViewProps) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      // Search filter
      if (
        searchValue &&
        !teacher.name.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return false
      }

      // Instrument filter
      if (
        selectedInstrument &&
        !teacher.instrumentsTaught.includes(selectedInstrument)
      ) {
        return false
      }

      // Active filter
      if (activeFilter === 'active' && !teacher.active) {
        return false
      }
      if (activeFilter === 'inactive' && teacher.active) {
        return false
      }

      return true
    })
  }, [teachers, searchValue, selectedInstrument, activeFilter])

  const activeCount = teachers.filter((t) => t.active).length
  const inactiveCount = teachers.filter((t) => !t.active).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Teachers
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeCount} active, {inactiveCount} inactive
            </p>
          </div>
          <button
            onClick={onAddTeacher}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Teacher
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
            placeholder="Search teachers..."
          />
        </div>

        {/* Results count */}
        {(searchValue || selectedInstrument || activeFilter !== 'all') && (
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </p>
        )}

        {/* Teacher grid */}
        {filteredTeachers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                instruments={instruments}
                availability={teacherAvailability[teacher.id] || []}
                onView={() => onViewTeacher?.(teacher.id)}
                onEdit={() => onEditTeacher?.(teacher.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-slate-900 dark:text-slate-100">
              No teachers found
            </h3>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              {searchValue || selectedInstrument || activeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first teacher to get started'}
            </p>
            {!searchValue && !selectedInstrument && activeFilter === 'all' && (
              <button
                onClick={onAddTeacher}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Teacher
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
