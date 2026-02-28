'use client'

import type { AttendanceRecord, AttendanceStatus, Class } from '@/types/classes'

interface AttendanceListProps {
    records: AttendanceRecord[]
    classes: Class[]
    teachers: Array<{ id: string; name: string }>
    students: Array<{ id: string; name: string }>
    instruments: Array<{ id: string; name: string }>
    onStatusChange: (recordId: string, status: AttendanceStatus) => void
    onRowClick: (record: AttendanceRecord) => void
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
    { value: 'present', label: 'Present', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'makeup', label: 'Make-up', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
]

function getStatusColor(status: AttendanceStatus): string {
    return STATUS_OPTIONS.find((s) => s.value === status)?.color || STATUS_OPTIONS[0].color
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(time: string | null): string {
    if (!time) return '-'
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${minutes} ${ampm}`
}

export function AttendanceList({
    records,
    classes,
    teachers,
    students,
    instruments,
    onStatusChange,
    onRowClick,
}: AttendanceListProps) {
    // Sort records by date, then time
    const sortedRecords = [...records].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return (a.time || '').localeCompare(b.time || '')
    })

    const getClassName = (classId: string) => {
        const cls = classes.find((c) => c.id === classId)
        if (!cls) return { teacher: 'Unknown', instrument: 'Unknown' }
        const teacher = teachers.find((t) => t.id === cls.teacherId)
        const instrument = instruments.find((i) => i.id === cls.instrumentId)
        return {
            teacher: teacher?.name || 'Unknown',
            instrument: instrument?.name || 'Unknown',
        }
    }

    const getStudentName = (studentId: string) => {
        return students.find((s) => s.id === studentId)?.name || 'Unknown'
    }

    if (sortedRecords.length === 0) {
        return (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="text-slate-500 dark:text-slate-400">
                    No attendance records for this week. Click "Generate Week" to create scheduled entries.
                </p>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Date / Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Instrument
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Teacher
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Remarks
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {sortedRecords.map((record) => {
                        const classInfo = getClassName(record.classId)
                        return (
                            <tr
                                key={record.id}
                                onClick={() => onRowClick(record)}
                                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                                    <div>{formatDate(record.date)}</div>
                                    <div className="text-slate-500 dark:text-slate-400">{formatTime(record.time)}</div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                    {classInfo.instrument}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                    {classInfo.teacher}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                    {getStudentName(record.studentId)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                                    <select
                                        value={record.status}
                                        onChange={(e) => onStatusChange(record.id, e.target.value as AttendanceStatus)}
                                        className={`rounded-md border-0 px-2 py-1 text-sm font-medium ${getStatusColor(record.status)}`}
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="max-w-[200px] truncate px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                    {record.remarks || '-'}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
