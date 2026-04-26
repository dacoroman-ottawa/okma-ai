'use client'

import { Music, User, Users, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { AttendanceRecord, AttendanceStatus, Class } from '@/types/classes'

interface AttendanceListInlineProps {
    records: AttendanceRecord[]
    classes: Class[]
    teachers: Array<{ id: string; name: string }>
    students: Array<{ id: string; name: string }>
    instruments: Array<{ id: string; name: string }>
    onStatusChange: (recordId: string, status: AttendanceStatus) => void
    onRowClick: (record: AttendanceRecord) => void
    onDelete?: (recordId: string) => void
    readOnly?: boolean
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
    { value: 'present', label: 'Present', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' },
    { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' },
    { value: 'makeup', label: 'Make-up', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400' },
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
    const [hours, minutes] = time.split(':').map(Number)
    const suffix = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${suffix}`
}

export function AttendanceListInline({
    records,
    classes,
    teachers,
    students,
    instruments,
    onStatusChange,
    onRowClick,
    onDelete,
    readOnly = false,
}: AttendanceListInlineProps) {
    const [openMenu, setOpenMenu] = useState<string | null>(null)

    const getClassInfo = (classId: string) => {
        const cls = classes.find((c) => c.id === classId)
        if (!cls) return { teacher: 'Unknown', instrument: 'Unknown', isGroup: false }
        const teacher = teachers.find((t) => t.id === cls.teacherId)
        const instrument = instruments.find((i) => i.id === cls.instrumentId)
        return {
            teacher: teacher?.name || 'Unknown',
            instrument: instrument?.name || 'Unknown',
            isGroup: cls.type === 'group',
        }
    }

    const getStudentName = (studentId: string) => {
        return students.find((s) => s.id === studentId)?.name || 'Unknown'
    }

    // Sort records by date, then time
    const sortedRecords = [...records].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return (a.time || '').localeCompare(b.time || '')
    })

    return (
        <div className="overflow-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {/* Table header */}
            <div className="sticky top-0 z-10 hidden grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 sm:grid">
                <div className="col-span-2">Date / Time</div>
                <div className="col-span-2">Instrument</div>
                <div className="col-span-2">Teacher</div>
                <div className="col-span-2">Student</div>
                <div className="col-span-1 text-center">Duration</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-center">Credits</div>
                <div className="col-span-1">Remarks</div>
            </div>

            {/* Table body */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedRecords.map((record, index) => {
                    const classInfo = getClassInfo(record.classId)
                    const isCancelled = record.status === 'cancelled'
                    // Open dropdown downward for first 2 items, upward for the rest
                    const openDownward = index < 2

                    return (
                        <div
                            key={record.id}
                            onClick={() => onRowClick(record)}
                            className={`grid cursor-pointer grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:grid-cols-12 sm:gap-4 sm:items-center ${isCancelled ? 'opacity-50' : ''}`}
                        >
                            {/* Date / Time */}
                            <div className="col-span-2">
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                    {formatDate(record.date)}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {formatTime(record.time)}
                                </p>
                            </div>

                            {/* Instrument */}
                            <div className="col-span-2 flex items-center gap-2">
                                <Music className="h-4 w-4 text-amber-500" />
                                <span className="text-slate-700 dark:text-slate-300">
                                    {classInfo.instrument}
                                </span>
                            </div>

                            {/* Teacher */}
                            <div className="col-span-2 text-slate-700 dark:text-slate-300">
                                {classInfo.teacher}
                            </div>

                            {/* Student */}
                            <div className="col-span-2 flex items-center gap-2">
                                {classInfo.isGroup ? (
                                    <Users className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <User className="h-4 w-4 text-slate-400" />
                                )}
                                <span className="truncate text-slate-700 dark:text-slate-300">
                                    {getStudentName(record.studentId)}
                                </span>
                            </div>

                            {/* Duration */}
                            <div className="col-span-1 text-center text-sm text-slate-700 dark:text-slate-300">
                                {record.duration ? `${record.duration}m` : '-'}
                            </div>

                            {/* Status */}
                            <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                                {readOnly ? (
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(record.status)}`}>
                                        {STATUS_OPTIONS.find((s) => s.value === record.status)?.label || record.status}
                                    </span>
                                ) : (
                                    <select
                                        value={record.status}
                                        onChange={(e) => onStatusChange(record.id, e.target.value as AttendanceStatus)}
                                        className={`rounded-full border-0 px-2 py-0.5 text-xs font-medium ${getStatusColor(record.status)}`}
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Credits */}
                            <div className="col-span-1 text-center">
                                <span className={`text-sm font-medium ${(record.credits ?? 0) < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {record.credits ?? 0}
                                </span>
                            </div>

                            {/* Remarks */}
                            <div className="col-span-1 flex items-center justify-between">
                                <span className="truncate text-sm text-slate-500 dark:text-slate-400">
                                    {record.remarks || '-'}
                                </span>
                                {!readOnly && (
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setOpenMenu(openMenu === record.id ? null : record.id)
                                            }}
                                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>

                                        {openMenu === record.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setOpenMenu(null)
                                                    }}
                                                />
                                                <div className={`absolute right-0 z-20 w-32 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900 ${openDownward ? 'top-full mt-1' : 'bottom-full mb-1'}`}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onRowClick(record)
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
                                                            if (onDelete) {
                                                                onDelete(record.id)
                                                            }
                                                            setOpenMenu(null)
                                                        }}
                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {records.length === 0 && (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No attendance records for this week. Click &quot;Generate Week&quot; to create scheduled entries.
                </div>
            )}
        </div>
    )
}
