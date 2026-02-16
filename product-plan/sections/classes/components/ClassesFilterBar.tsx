import { useState } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

interface ClassesFilterBarProps {
  teachers: Array<{ id: string; name: string }>
  students: Array<{ id: string; name: string }>
  instruments: Array<{ id: string; name: string }>
  selectedTeacher: string | null
  selectedStudent: string | null
  selectedInstrument: string | null
  selectedDay: string | null
  onTeacherChange: (id: string | null) => void
  onStudentChange: (id: string | null) => void
  onInstrumentChange: (id: string | null) => void
  onDayChange: (day: string | null) => void
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function ClassesFilterBar({
  teachers,
  students,
  instruments,
  selectedTeacher,
  selectedStudent,
  selectedInstrument,
  selectedDay,
  onTeacherChange,
  onStudentChange,
  onInstrumentChange,
  onDayChange,
}: ClassesFilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const hasActiveFilters =
    selectedTeacher || selectedStudent || selectedInstrument || selectedDay

  const clearAllFilters = () => {
    onTeacherChange(null)
    onStudentChange(null)
    onInstrumentChange(null)
    onDayChange(null)
  }

  const renderDropdown = (
    label: string,
    options: Array<{ id: string; name: string }>,
    selectedId: string | null,
    onChange: (id: string | null) => void
  ) => {
    const isOpen = openDropdown === label
    const selectedOption = options.find((o) => o.id === selectedId)

    return (
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : label)}
          className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
            selectedId
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <span className="max-w-[120px] truncate">
            {selectedOption?.name || label}
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpenDropdown(null)}
            />
            <div className="absolute left-0 z-20 mt-1 max-h-60 w-48 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <button
                onClick={() => {
                  onChange(null)
                  setOpenDropdown(null)
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  !selectedId
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                All {label}s
              </button>
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id)
                    setOpenDropdown(null)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    selectedId === option.id
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {renderDropdown('Teacher', teachers, selectedTeacher, onTeacherChange)}
      {renderDropdown('Student', students, selectedStudent, onStudentChange)}
      {renderDropdown('Instrument', instruments, selectedInstrument, onInstrumentChange)}

      {/* Day dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpenDropdown(openDropdown === 'Day' ? null : 'Day')}
          className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
            selectedDay
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <span>{selectedDay || 'Day'}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {openDropdown === 'Day' && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpenDropdown(null)}
            />
            <div className="absolute left-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <button
                onClick={() => {
                  onDayChange(null)
                  setOpenDropdown(null)
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  !selectedDay
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                All Days
              </button>
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => {
                    onDayChange(day)
                    setOpenDropdown(null)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    selectedDay === day
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="flex h-9 items-center gap-1 rounded-lg px-3 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  )
}
