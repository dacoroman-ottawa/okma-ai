import { Music, Clock } from 'lucide-react'
import type { Student, Instrument, AvailabilitySlot } from '../types'

interface StudentCardProps {
  student: Student
  instruments: Instrument[]
  availability: AvailabilitySlot[]
  onView?: () => void
  onEdit?: () => void
}

const levelColors = {
  Beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  Intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  Advanced: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
}

export function StudentCard({
  student,
  instruments,
  availability,
  onView,
  onEdit,
}: StudentCardProps) {
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const availableDays = [...new Set(availability.map((slot) => slot.day))]

  const age = student.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(student.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null

  return (
    <div
      onClick={onView}
      className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:shadow-indigo-950/50"
    >
      {/* Status indicator */}
      <div className="absolute right-4 top-4">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            student.active
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {student.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Header with initials avatar */}
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-lg font-semibold text-white shadow-md shadow-amber-200 dark:shadow-amber-950">
          {initials}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
            {student.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {age !== null ? `${age} years old` : 'Age not specified'}
          </p>
        </div>
      </div>

      {/* Skill levels */}
      <div className="mb-4">
        {student.skillLevels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {student.skillLevels.map((skill) => {
              const instrumentName = instruments.find(
                (i) => i.id === skill.instrumentId
              )?.name
              return (
                <span
                  key={skill.instrumentId}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${levelColors[skill.level]}`}
                >
                  <Music className="h-3 w-3" />
                  {instrumentName} · {skill.level}
                </span>
              )
            })}
          </div>
        ) : (
          <span className="text-sm text-slate-400 dark:text-slate-500">
            No instruments yet
          </span>
        )}
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>
            {availableDays.length > 0
              ? `${availableDays.length} days/week`
              : 'No availability'}
          </span>
        </div>
      </div>

      {/* Hover overlay with edit button */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end rounded-xl p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.()
          }}
          className="pointer-events-auto rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 dark:bg-slate-100 dark:text-slate-900"
        >
          Edit
        </button>
      </div>
    </div>
  )
}
