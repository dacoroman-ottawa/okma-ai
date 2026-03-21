import type { Class } from '@/types/classes'
import { ClassCard } from './ClassCard'

interface ClassesCalendarProps {
    classes: Class[]
    teachers: Array<{ id: string; name: string }>
    students: Array<{ id: string; name: string }>
    instruments: Array<{ id: string; name: string }>
    selectedDay?: string | null
    onViewClass?: (id: string) => void
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8 AM to 8 PM
const SLOTS_PER_HOUR = 4 // 15-minute intervals

function formatHour(hour: number): string {
    const suffix = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour} ${suffix}`
}

function parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours + minutes / 60
}

// Check if two classes overlap in time
function classesOverlap(a: Class, b: Class): boolean {
    const aStart = parseTime(a.startTime)
    const aEnd = aStart + a.duration / 60
    const bStart = parseTime(b.startTime)
    const bEnd = bStart + b.duration / 60
    return aStart < bEnd && bStart < aEnd
}

// Assign column positions to overlapping classes
function assignColumns(dayClasses: Class[]): Map<string, { column: number; totalColumns: number }> {
    const result = new Map<string, { column: number; totalColumns: number }>()

    if (dayClasses.length === 0) return result

    // Sort by start time, then by duration (longer first)
    const sorted = [...dayClasses].sort((a, b) => {
        const startDiff = parseTime(a.startTime) - parseTime(b.startTime)
        if (startDiff !== 0) return startDiff
        return b.duration - a.duration
    })

    // Build overlap groups
    const groups: Class[][] = []

    for (const classItem of sorted) {
        // Find a group this class overlaps with
        let addedToGroup = false
        for (const group of groups) {
            if (group.some(c => classesOverlap(c, classItem))) {
                group.push(classItem)
                addedToGroup = true
                break
            }
        }
        if (!addedToGroup) {
            groups.push([classItem])
        }
    }

    // Merge overlapping groups
    let merged = true
    while (merged) {
        merged = false
        for (let i = 0; i < groups.length; i++) {
            for (let j = i + 1; j < groups.length; j++) {
                // Check if any class in group i overlaps with any class in group j
                const overlaps = groups[i].some(ci =>
                    groups[j].some(cj => classesOverlap(ci, cj))
                )
                if (overlaps) {
                    groups[i] = [...groups[i], ...groups[j]]
                    groups.splice(j, 1)
                    merged = true
                    break
                }
            }
            if (merged) break
        }
    }

    // Assign columns within each group
    for (const group of groups) {
        // Sort group by start time
        group.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime))

        const columns: Class[][] = []

        for (const classItem of group) {
            // Find the first column where this class doesn't overlap
            let placed = false
            for (let col = 0; col < columns.length; col++) {
                const canPlace = !columns[col].some(c => classesOverlap(c, classItem))
                if (canPlace) {
                    columns[col].push(classItem)
                    result.set(classItem.id, { column: col, totalColumns: 0 })
                    placed = true
                    break
                }
            }
            if (!placed) {
                columns.push([classItem])
                result.set(classItem.id, { column: columns.length - 1, totalColumns: 0 })
            }
        }

        // Update totalColumns for all classes in this group
        const totalCols = columns.length
        for (const classItem of group) {
            const data = result.get(classItem.id)!
            result.set(classItem.id, { ...data, totalColumns: totalCols })
        }
    }

    return result
}

export function ClassesCalendar({
    classes,
    teachers,
    students,
    instruments,
    selectedDay,
    onViewClass,
}: ClassesCalendarProps) {
    // Group classes by day
    const classesByDay: Record<string, Class[]> = {}
    DAYS.forEach((day) => {
        classesByDay[day] = classes.filter((c) => c.weekday === day)
    })

    // Calculate column assignments for each day
    const columnsByDay: Record<string, Map<string, { column: number; totalColumns: number }>> = {}
    DAYS.forEach((day) => {
        columnsByDay[day] = assignColumns(classesByDay[day] || [])
    })

    const displayedDays = selectedDay ? [selectedDay] : DAYS

    const getTeacherName = (id: string) =>
        teachers.find((t) => t.id === id)?.name || 'Unknown'

    const getStudentNames = (ids: string[]) =>
        ids.map((id) => students.find((s) => s.id === id)?.name || 'Unknown')

    const getInstrumentName = (id: string) =>
        instruments.find((i) => i.id === id)?.name || 'Unknown'

    // Calculate position, height, and width for a class block
    // Grid spans 13 hours (8 AM to 8 PM inclusive), so divide by 13
    const getClassStyle = (classItem: Class, day: string) => {
        const startHour = parseTime(classItem.startTime)
        const topPercent = ((startHour - 8) / 13) * 100
        const heightPercent = (classItem.duration / 60 / 13) * 100

        const columnData = columnsByDay[day]?.get(classItem.id)
        const column = columnData?.column ?? 0
        const totalColumns = columnData?.totalColumns ?? 1

        const widthPercent = 100 / totalColumns
        const leftPercent = column * widthPercent

        return {
            top: `${topPercent}%`,
            height: `${heightPercent}%`,
            left: `calc(${leftPercent}% + 2px)`,
            width: `calc(${widthPercent}% - 4px)`,
        }
    }

    return (
        <div className="overflow-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            <div className="min-w-[900px]">
                {/* Header row with days */}
                <div className={`sticky top-0 z-10 grid border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${selectedDay ? 'grid-cols-[120px_1fr]' : 'grid-cols-8'}`}>
                    <div className="p-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Time
                    </div>
                    {displayedDays.map((day) => (
                        <div
                            key={day}
                            className="border-l border-slate-200 p-3 text-center text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar body */}
                <div className={`relative grid ${selectedDay ? 'grid-cols-[120px_1fr]' : 'grid-cols-8'}`}>
                    {/* Time labels column */}
                    <div className="border-r border-slate-200 dark:border-slate-800">
                        {HOURS.map((hour) => (
                            <div key={hour} className="relative">
                                {/* 15-minute slots within each hour */}
                                {Array.from({ length: SLOTS_PER_HOUR }).map((_, slotIndex) => (
                                    <div
                                        key={slotIndex}
                                        className={`h-8 ${
                                            slotIndex === SLOTS_PER_HOUR - 1
                                                ? 'border-b border-slate-200 dark:border-slate-700'
                                                : 'border-b border-slate-100 dark:border-slate-800'
                                        }`}
                                    >
                                        {slotIndex === 0 && (
                                            <span className="block px-3 text-right text-xs text-slate-400 dark:text-slate-500">
                                                {formatHour(hour)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Day columns with class blocks */}
                    {displayedDays.map((day) => (
                        <div
                            key={day}
                            className="relative border-l border-slate-200 dark:border-slate-800"
                        >
                            {/* Hour grid lines with 15-minute subdivisions */}
                            {HOURS.map((hour) => (
                                <div key={hour}>
                                    {Array.from({ length: SLOTS_PER_HOUR }).map((_, slotIndex) => (
                                        <div
                                            key={slotIndex}
                                            className={`h-8 ${
                                                slotIndex === SLOTS_PER_HOUR - 1
                                                    ? 'border-b border-slate-200 dark:border-slate-700'
                                                    : 'border-b border-slate-100 dark:border-slate-800'
                                            }`}
                                        />
                                    ))}
                                </div>
                            ))}

                            {/* Class blocks */}
                            <div className="absolute inset-0">
                                {classesByDay[day]?.map((classItem) => {
                                    const style = getClassStyle(classItem, day)
                                    return (
                                        <div
                                            key={classItem.id}
                                            className="absolute"
                                            style={style}
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
