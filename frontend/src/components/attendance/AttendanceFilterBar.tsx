'use client'

import { X } from 'lucide-react'
import type { AttendanceStatus } from '@/types/classes'

interface AttendanceFilterBarProps {
    teachers: Array<{ id: string; name: string }>
    students: Array<{ id: string; name: string }>
    selectedTeacher: string | null
    selectedStudent: string | null
    selectedStatus: AttendanceStatus | null
    onTeacherChange: (id: string | null) => void
    onStudentChange: (id: string | null) => void
    onStatusChange: (status: AttendanceStatus | null) => void
    onClearAll: () => void
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'makeup', label: 'Make-up' },
]

export function AttendanceFilterBar({
    teachers,
    students,
    selectedTeacher,
    selectedStudent,
    selectedStatus,
    onTeacherChange,
    onStudentChange,
    onStatusChange,
    onClearAll,
}: AttendanceFilterBarProps) {
    const hasFilters = selectedTeacher || selectedStudent || selectedStatus

    return (
        <div className="flex flex-wrap items-center gap-3">
            <select
                value={selectedTeacher || ''}
                onChange={(e) => onTeacherChange(e.target.value || null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
                <option value="">All Teachers</option>
                {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.name}
                    </option>
                ))}
            </select>

            <select
                value={selectedStudent || ''}
                onChange={(e) => onStudentChange(e.target.value || null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
                <option value="">All Students</option>
                {students.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                ))}
            </select>

            <select
                value={selectedStatus || ''}
                onChange={(e) => onStatusChange((e.target.value as AttendanceStatus) || null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                ))}
            </select>

            {hasFilters && (
                <button
                    onClick={onClearAll}
                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                    <X className="h-4 w-4" />
                    Clear
                </button>
            )}
        </div>
    )
}
