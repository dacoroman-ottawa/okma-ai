import type { Class } from '../types'
import { ClassCard } from './ClassCard'

interface ClassesCalendarProps {
  classes: Class[]
  teachers: Array<{ id: string; name: string }>
  students: Array<{ id: string; name: string }>
  instruments: Array<{ id: string; name: string }>
  onViewClass?: (id: string) => void
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8 AM to 8 PM

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour} ${suffix}`
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours + minutes / 60
}

export function ClassesCalendar({
  classes,
  teachers,
  students,
  instruments,
  onViewClass,
}: ClassesCalendarProps) {
  // Group classes by day
  const classesByDay: Record<string, Class[]> = {}
  DAYS.forEach((day) => {
    classesByDay[day] = classes.filter((c) => c.weekday === day)
  })

  const getTeacherName = (id: string) =>
    teachers.find((t) => t.id === id)?.name || 'Unknown'

  const getStudentNames = (ids: string[]) =>
    ids.map((id) => students.find((s) => s.id === id)?.name || 'Unknown')

  const getInstrumentName = (id: string) =>
    instruments.find((i) => i.id === id)?.name || 'Unknown'

  // Calculate position and height for a class block
  const getClassPosition = (classItem: Class) => {
    const startHour = parseTime(classItem.startTime)
    const topPercent = ((startHour - 8) / 12) * 100
    const heightPercent = (classItem.duration / 60 / 12) * 100
    return { top: `${topPercent}%`, height: `${heightPercent}%` }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="min-w-[900px]">
        {/* Header row with days */}
        <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800">
          <div className="p-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            Time
          </div>
          {DAYS.map((day) => (
            <div
              key={day}
              className="border-l border-slate-200 p-3 text-center text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar body */}
        <div className="relative grid grid-cols-8">
          {/* Time labels column */}
          <div className="border-r border-slate-200 dark:border-slate-800">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-slate-100 px-3 py-1 text-right text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Day columns with class blocks */}
          {DAYS.map((day) => (
            <div
              key={day}
              className="relative border-l border-slate-200 dark:border-slate-800"
            >
              {/* Hour grid lines */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-slate-100 dark:border-slate-800"
                />
              ))}

              {/* Class blocks */}
              <div className="absolute inset-0 p-1">
                {classesByDay[day]?.map((classItem) => {
                  const position = getClassPosition(classItem)
                  return (
                    <div
                      key={classItem.id}
                      className="absolute left-1 right-1"
                      style={{ top: position.top, height: position.height }}
                    >
                      <ClassCard
                        classItem={classItem}
                        teacherName={getTeacherName(classItem.teacherId)}
                        studentNames={getStudentNames(classItem.studentIds)}
                        instrumentName={getInstrumentName(classItem.instrumentId)}
                        onClick={() => onViewClass?.(classItem.id)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
