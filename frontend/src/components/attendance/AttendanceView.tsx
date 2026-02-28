'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react'
import type { AttendanceRecord, AttendanceStatus, Class } from '@/types/classes'
import { AttendanceList } from './AttendanceList'
import { AttendanceModal } from './AttendanceModal'
import { AttendanceFilterBar } from './AttendanceFilterBar'

interface AttendanceViewProps {
    records: AttendanceRecord[]
    classes: Class[]
    teachers: Array<{ id: string; name: string }>
    students: Array<{ id: string; name: string }>
    instruments: Array<{ id: string; name: string }>
    weekStart: Date
    weekEnd: Date
    onPreviousWeek: () => void
    onNextWeek: () => void
    onCurrentWeek: () => void
    onStatusChange: (recordId: string, status: AttendanceStatus) => Promise<void>
    onUpdateRecord: (recordId: string, data: { date?: string; time?: string; status?: AttendanceStatus; remarks?: string }) => Promise<void>
    onCreateRecord: (data: { classId: string; studentId: string; date: string; time?: string; status?: AttendanceStatus; remarks?: string }) => Promise<void>
    onGenerateWeek: () => Promise<void>
}

function formatWeekRange(start: Date, end: Date): string {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' })
    return `${startStr} - ${endStr}`
}

export function AttendanceView({
    records,
    classes,
    teachers,
    students,
    instruments,
    weekStart,
    weekEnd,
    onPreviousWeek,
    onNextWeek,
    onCurrentWeek,
    onStatusChange,
    onUpdateRecord,
    onCreateRecord,
    onGenerateWeek,
}: AttendanceViewProps) {
    const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(null)
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit')
    const [generating, setGenerating] = useState(false)

    const filteredRecords = useMemo(() => {
        return records.filter((r) => {
            // Filter by teacher (via class)
            if (selectedTeacher) {
                const cls = classes.find((c) => c.id === r.classId)
                if (cls?.teacherId !== selectedTeacher) return false
            }
            // Filter by student
            if (selectedStudent && r.studentId !== selectedStudent) return false
            // Filter by status
            if (selectedStatus && r.status !== selectedStatus) return false
            return true
        })
    }, [records, classes, selectedTeacher, selectedStudent, selectedStatus])

    const handleRowClick = (record: AttendanceRecord) => {
        setSelectedRecord(record)
        setModalMode('edit')
        setIsModalOpen(true)
    }

    const handleAddEntry = () => {
        setSelectedRecord(null)
        setModalMode('create')
        setIsModalOpen(true)
    }

    const handleGenerateWeek = async () => {
        setGenerating(true)
        try {
            await onGenerateWeek()
        } finally {
            setGenerating(false)
        }
    }

    const handleClearFilters = () => {
        setSelectedTeacher(null)
        setSelectedStudent(null)
        setSelectedStatus(null)
    }

    const handleStatusChange = async (recordId: string, status: AttendanceStatus) => {
        await onStatusChange(recordId, status)
    }

    const handleSave = async (data: { date?: string; time?: string; status?: AttendanceStatus; remarks?: string }) => {
        if (selectedRecord) {
            await onUpdateRecord(selectedRecord.id, data)
        }
    }

    const handleCreate = async (data: { classId: string; studentId: string; date: string; time?: string; status?: AttendanceStatus; remarks?: string }) => {
        await onCreateRecord(data)
    }

    // Summary counts
    const statusCounts = useMemo(() => {
        const counts = { scheduled: 0, present: 0, absent: 0, cancelled: 0, makeup: 0 }
        records.forEach((r) => {
            if (r.status in counts) {
                counts[r.status as keyof typeof counts]++
            }
        })
        return counts
    }, [records])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            Attendance
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {statusCounts.present} present, {statusCounts.absent} absent, {statusCounts.scheduled} scheduled
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleGenerateWeek}
                            disabled={generating}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <Calendar className="h-4 w-4" />
                            {generating ? 'Generating...' : 'Generate Week'}
                        </button>
                        <button
                            onClick={handleAddEntry}
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
                        >
                            <Plus className="h-4 w-4" />
                            Add Entry
                        </button>
                    </div>
                </div>

                {/* Week Navigation */}
                <div className="mb-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <button
                        onClick={onPreviousWeek}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {formatWeekRange(weekStart, weekEnd)}
                        </p>
                        <button
                            onClick={onCurrentWeek}
                            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                            Today
                        </button>
                    </div>
                    <button
                        onClick={onNextWeek}
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6">
                    <AttendanceFilterBar
                        teachers={teachers}
                        students={students}
                        selectedTeacher={selectedTeacher}
                        selectedStudent={selectedStudent}
                        selectedStatus={selectedStatus}
                        onTeacherChange={setSelectedTeacher}
                        onStudentChange={setSelectedStudent}
                        onStatusChange={setSelectedStatus}
                        onClearAll={handleClearFilters}
                    />
                </div>

                {/* Results count when filtered */}
                {(selectedTeacher || selectedStudent || selectedStatus) && (
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        Showing {filteredRecords.length} of {records.length} records
                    </p>
                )}

                {/* Attendance List */}
                <AttendanceList
                    records={filteredRecords}
                    classes={classes}
                    teachers={teachers}
                    students={students}
                    instruments={instruments}
                    onStatusChange={handleStatusChange}
                    onRowClick={handleRowClick}
                />
            </div>

            {/* Modal */}
            <AttendanceModal
                isOpen={isModalOpen}
                record={selectedRecord}
                classes={classes}
                teachers={teachers}
                students={students}
                instruments={instruments}
                mode={modalMode}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onCreate={handleCreate}
            />
        </div>
    )
}
