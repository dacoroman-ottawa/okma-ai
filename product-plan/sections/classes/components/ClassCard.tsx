import { Users, User, Clock, Music } from 'lucide-react'
import type { Class } from '../types'

interface ClassCardProps {
  classItem: Class
  teacherName: string
  studentNames: string[]
  instrumentName: string
  onClick?: () => void
}

export function ClassCard({
  classItem,
  teacherName,
  studentNames,
  instrumentName,
  onClick,
}: ClassCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${suffix}`
  }

  const endTime = () => {
    const [hours, minutes] = classItem.startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + classItem.duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMins = totalMinutes % 60
    return formatTime(`${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`)
  }

  const isCancelled = classItem.status === 'cancelled'
  const isGroup = classItem.type === 'group'

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-lg border p-2 text-xs transition-all hover:shadow-md ${
        isCancelled
          ? 'border-red-200 bg-red-50 opacity-60 dark:border-red-900 dark:bg-red-950/30'
          : isGroup
            ? 'border-amber-200 bg-amber-50 hover:border-amber-300 dark:border-amber-900 dark:bg-amber-950/30 dark:hover:border-amber-800'
            : 'border-indigo-200 bg-indigo-50 hover:border-indigo-300 dark:border-indigo-900 dark:bg-indigo-950/30 dark:hover:border-indigo-800'
      }`}
    >
      {/* Header with time and type */}
      <div className="mb-1.5 flex items-center justify-between">
        <span
          className={`font-medium ${
            isCancelled
              ? 'text-red-700 dark:text-red-400'
              : isGroup
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-indigo-700 dark:text-indigo-400'
          }`}
        >
          {formatTime(classItem.startTime)}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
            isCancelled
              ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
              : isGroup
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
          }`}
        >
          {isCancelled ? 'Cancelled' : isGroup ? 'Group' : 'Private'}
        </span>
      </div>

      {/* Instrument */}
      <div className="mb-1 flex items-center gap-1 text-slate-600 dark:text-slate-400">
        <Music className="h-3 w-3" />
        <span className="truncate font-medium">{instrumentName}</span>
      </div>

      {/* Teacher */}
      <div className="mb-1 truncate text-slate-500 dark:text-slate-500">
        {teacherName}
      </div>

      {/* Students */}
      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-500">
        {isGroup ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
        <span className="truncate">
          {studentNames.length > 2
            ? `${studentNames[0]} +${studentNames.length - 1}`
            : studentNames.join(', ')}
        </span>
      </div>

      {/* Duration */}
      <div className="mt-1.5 flex items-center gap-1 text-slate-400 dark:text-slate-600">
        <Clock className="h-3 w-3" />
        <span>{classItem.duration} min</span>
      </div>
    </div>
  )
}
