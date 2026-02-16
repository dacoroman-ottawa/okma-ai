import { Music, Clock, DollarSign } from 'lucide-react'
import type { Teacher, Instrument, AvailabilitySlot } from '../types'

interface TeacherCardProps {
  teacher: Teacher
  instruments: Instrument[]
  availability: AvailabilitySlot[]
  onView?: () => void
  onEdit?: () => void
}

export function TeacherCard({
  teacher,
  instruments,
  availability,
  onView,
  onEdit,
}: TeacherCardProps) {
  const instrumentNames = teacher.instrumentsTaught
    .map((id) => instruments.find((i) => i.id === id)?.name)
    .filter(Boolean)

  const initials = teacher.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const availableDays = [...new Set(availability.map((slot) => slot.day))]

  return (
    <div
      onClick={onView}
      className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:shadow-indigo-950/50"
    >
      {/* Status indicator */}
      <div className="absolute right-4 top-4">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            teacher.active
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {teacher.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Header with initials avatar */}
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-lg font-semibold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950">
          {initials}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
            {teacher.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {teacher.specialization}
          </p>
        </div>
      </div>

      {/* Instruments */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5">
          {instrumentNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
            >
              <Music className="h-3 w-3" />
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4" />
          <span>${teacher.hourlyRate}/hr</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>
            {availableDays.length > 0
              ? `${availableDays.length} days/week`
              : 'No availability'}
          </span>
        </div>
      </div>

      {/* Qualification badge */}
      <div className="mt-3">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {teacher.qualification}
        </span>
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
