import { Clock, Music, User, Users, MoreVertical, Edit, Calendar, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { Class } from '../types'

interface ClassesListProps {
  classes: Class[]
  teachers: Array<{ id: string; name: string }>
  students: Array<{ id: string; name: string }>
  instruments: Array<{ id: string; name: string }>
  onViewClass?: (id: string) => void
  onEditClass?: (id: string) => void
  onRescheduleClass?: (id: string) => void
  onCancelClass?: (id: string) => void
}

export function ClassesList({
  classes,
  teachers,
  students,
  instruments,
  onViewClass,
  onEditClass,
  onRescheduleClass,
  onCancelClass,
}: ClassesListProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const getTeacherName = (id: string) =>
    teachers.find((t) => t.id === id)?.name || 'Unknown'

  const getStudentNames = (ids: string[]) =>
    ids.map((id) => students.find((s) => s.id === id)?.name || 'Unknown')

  const getInstrumentName = (id: string) =>
    instruments.find((i) => i.id === id)?.name || 'Unknown'

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${suffix}`
  }

  // Sort by day of week then by time
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const sortedClasses = [...classes].sort((a, b) => {
    const dayDiff = dayOrder.indexOf(a.weekday) - dayOrder.indexOf(b.weekday)
    if (dayDiff !== 0) return dayDiff
    return a.startTime.localeCompare(b.startTime)
  })

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Table header */}
      <div className="hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 sm:grid">
        <div className="col-span-2">Day / Time</div>
        <div className="col-span-2">Instrument</div>
        <div className="col-span-2">Teacher</div>
        <div className="col-span-3">Students</div>
        <div className="col-span-2">Type / Duration</div>
        <div className="col-span-1"></div>
      </div>

      {/* Table body */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {sortedClasses.map((classItem) => {
          const isCancelled = classItem.status === 'cancelled'
          const isGroup = classItem.type === 'group'
          const studentNames = getStudentNames(classItem.studentIds)

          return (
            <div
              key={classItem.id}
              onClick={() => onViewClass?.(classItem.id)}
              className={`grid cursor-pointer grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:grid-cols-12 sm:gap-4 sm:items-center ${
                isCancelled ? 'opacity-50' : ''
              }`}
            >
              {/* Day / Time */}
              <div className="col-span-2">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {classItem.weekday}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatTime(classItem.startTime)}
                  {classItem.frequency === 2 && (
                    <span className="ml-1 text-xs text-indigo-600 dark:text-indigo-400">
                      (2x/week)
                    </span>
                  )}
                </p>
              </div>

              {/* Instrument */}
              <div className="col-span-2 flex items-center gap-2">
                <Music className="h-4 w-4 text-amber-500" />
                <span className="text-slate-700 dark:text-slate-300">
                  {getInstrumentName(classItem.instrumentId)}
                </span>
              </div>

              {/* Teacher */}
              <div className="col-span-2 text-slate-700 dark:text-slate-300">
                {getTeacherName(classItem.teacherId)}
              </div>

              {/* Students */}
              <div className="col-span-3 flex items-center gap-2">
                {isGroup ? (
                  <Users className="h-4 w-4 text-slate-400" />
                ) : (
                  <User className="h-4 w-4 text-slate-400" />
                )}
                <span className="truncate text-slate-700 dark:text-slate-300">
                  {studentNames.length > 2
                    ? `${studentNames[0]}, ${studentNames[1]} +${studentNames.length - 2}`
                    : studentNames.join(', ')}
                </span>
              </div>

              {/* Type / Duration */}
              <div className="col-span-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isCancelled
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                      : isGroup
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
                  }`}
                >
                  {isCancelled ? 'Cancelled' : isGroup ? 'Group' : 'Private'}
                </span>
                <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="h-3 w-3" />
                  {classItem.duration}m
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenu(openMenu === classItem.id ? null : classItem.id)
                    }}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {openMenu === classItem.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenu(null)
                        }}
                      />
                      <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditClass?.(classItem.id)
                            setOpenMenu(null)
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRescheduleClass?.(classItem.id)
                            setOpenMenu(null)
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Calendar className="h-4 w-4" />
                          Reschedule
                        </button>
                        {!isCancelled && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onCancelClass?.(classItem.id)
                              setOpenMenu(null)
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {classes.length === 0 && (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
          No classes found
        </div>
      )}
    </div>
  )
}
