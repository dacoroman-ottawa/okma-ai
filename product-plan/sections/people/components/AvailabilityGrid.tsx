import type { AvailabilitySlot } from '../types'

interface AvailabilityGridProps {
  slots: AvailabilitySlot[]
  editable?: boolean
  onUpdate?: (slots: AvailabilitySlot[]) => void
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8 AM to 8 PM

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}${suffix}`
}

function parseTime(time: string): number {
  const [hours] = time.split(':').map(Number)
  return hours
}

export function AvailabilityGrid({ slots, editable = false, onUpdate }: AvailabilityGridProps) {
  // Build a lookup for which cells are filled
  const filledCells = new Set<string>()

  slots.forEach((slot) => {
    const startHour = parseTime(slot.startTime)
    const endHour = parseTime(slot.endTime)
    for (let hour = startHour; hour < endHour; hour++) {
      filledCells.add(`${slot.day}-${hour}`)
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header row with days */}
        <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700">
          <div className="bg-slate-50 p-2 dark:bg-slate-900" />
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-slate-50 p-2 text-center text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-400"
            >
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Time rows */}
        <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700">
          {HOURS.map((hour) => (
            <>
              <div
                key={`label-${hour}`}
                className="bg-white p-2 text-right text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400"
              >
                {formatHour(hour)}
              </div>
              {DAYS.map((day) => {
                const cellKey = `${day}-${hour}`
                const isFilled = filledCells.has(cellKey)

                return (
                  <div
                    key={cellKey}
                    className={`h-8 transition-colors ${
                      isFilled
                        ? 'bg-indigo-100 dark:bg-indigo-900/50'
                        : 'bg-white dark:bg-slate-900'
                    } ${
                      editable
                        ? 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950'
                        : ''
                    }`}
                    title={
                      isFilled
                        ? `Available: ${day} ${formatHour(hour)}`
                        : `${day} ${formatHour(hour)}`
                    }
                  />
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-indigo-100 dark:bg-indigo-900/50" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  )
}
