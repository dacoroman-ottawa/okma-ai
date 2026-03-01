import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
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
}

const STATUSES: Array<{ id: AttendanceStatus; name: string }> = [
    { id: 'scheduled', name: 'Scheduled' },
    { id: 'present', name: 'Present' },
    { id: 'absent', name: 'Absent' },
    { id: 'cancelled', name: 'Cancelled' },
    { id: 'makeup', name: 'Make-up' },
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
}: AttendanceFilterBarProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    const hasActiveFilters = selectedTeacher || selectedStudent || selectedStatus

    const clearAllFilters = () => {
        onTeacherChange(null)
        onStudentChange(null)
        onStatusChange(null)
    }

    const renderDropdown = (
        label: string,
        options: Array<{ id: string; name: string }>,
        selectedId: string | null,
        onChange: (id: string | null) => void
    ) => {
        const isOpen = openDropdown === label
        const selectedOption = options.find((o) => o.id === selectedId)

        return (
            <div className="relative">
                <button
                    onClick={() => setOpenDropdown(isOpen ? null : label)}
                    className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${selectedId
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600'
                        }`}
                >
                    <span className="max-w-[120px] truncate">
                        {selectedOption?.name || label}
                    </span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute left-0 z-20 mt-1 max-h-60 w-48 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                            <button
                                onClick={() => {
                                    onChange(null)
                                    setOpenDropdown(null)
                                }}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${!selectedId
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                            >
                                All {label}s
                            </button>
                            {options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        onChange(option.id)
                                        setOpenDropdown(null)
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${selectedId === option.id
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {option.name}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        )
    }

    const renderStatusDropdown = () => {
        const isOpen = openDropdown === 'Status'
        const selectedOption = STATUSES.find((s) => s.id === selectedStatus)

        return (
            <div className="relative">
                <button
                    onClick={() => setOpenDropdown(isOpen ? null : 'Status')}
                    className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${selectedStatus
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600'
                        }`}
                >
                    <span>{selectedOption?.name || 'Status'}</span>
                    <ChevronDown className="h-4 w-4" />
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute left-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                            <button
                                onClick={() => {
                                    onStatusChange(null)
                                    setOpenDropdown(null)
                                }}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${!selectedStatus
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                            >
                                All Statuses
                            </button>
                            {STATUSES.map((status) => (
                                <button
                                    key={status.id}
                                    onClick={() => {
                                        onStatusChange(status.id)
                                        setOpenDropdown(null)
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${selectedStatus === status.id
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {status.name}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {renderDropdown('Teacher', teachers, selectedTeacher, onTeacherChange)}
            {renderDropdown('Student', students, selectedStudent, onStudentChange)}
            {renderStatusDropdown()}

            {/* Clear filters */}
            {hasActiveFilters && (
                <button
                    onClick={clearAllFilters}
                    className="flex h-9 items-center gap-1 rounded-lg px-3 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    <X className="h-4 w-4" />
                    Clear
                </button>
            )}
        </div>
    )
}
