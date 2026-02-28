'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { AttendanceRecord, AttendanceStatus, Class } from '@/types/classes'

interface AttendanceModalProps {
    isOpen: boolean
    record: AttendanceRecord | null
    classes: Class[]
    teachers: Array<{ id: string; name: string }>
    students: Array<{ id: string; name: string }>
    instruments: Array<{ id: string; name: string }>
    onClose: () => void
    onSave: (data: { date?: string; time?: string; status?: AttendanceStatus; remarks?: string }) => void
    onCreate?: (data: { classId: string; studentId: string; date: string; time?: string; status?: AttendanceStatus; remarks?: string }) => void
    mode: 'edit' | 'create'
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'makeup', label: 'Make-up' },
]

export function AttendanceModal({
    isOpen,
    record,
    classes,
    teachers,
    students,
    instruments,
    onClose,
    onSave,
    onCreate,
    mode,
}: AttendanceModalProps) {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [status, setStatus] = useState<AttendanceStatus>('scheduled')
    const [remarks, setRemarks] = useState('')
    const [selectedClassId, setSelectedClassId] = useState('')
    const [selectedStudentId, setSelectedStudentId] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (record && mode === 'edit') {
            setDate(record.date)
            setTime(record.time || '')
            setStatus(record.status)
            setRemarks(record.remarks || '')
        } else if (mode === 'create') {
            setDate(new Date().toISOString().split('T')[0])
            setTime('')
            setStatus('scheduled')
            setRemarks('')
            setSelectedClassId('')
            setSelectedStudentId('')
        }
    }, [record, mode, isOpen])

    if (!isOpen) return null

    const getClassInfo = () => {
        if (mode === 'create') {
            const cls = classes.find((c) => c.id === selectedClassId)
            if (!cls) return null
            const teacher = teachers.find((t) => t.id === cls.teacherId)
            const instrument = instruments.find((i) => i.id === cls.instrumentId)
            return { teacher: teacher?.name, instrument: instrument?.name, cls }
        }
        if (!record) return null
        const cls = classes.find((c) => c.id === record.classId)
        if (!cls) return null
        const teacher = teachers.find((t) => t.id === cls.teacherId)
        const instrument = instruments.find((i) => i.id === cls.instrumentId)
        const student = students.find((s) => s.id === record.studentId)
        return { teacher: teacher?.name, instrument: instrument?.name, student: student?.name, cls }
    }

    const classInfo = getClassInfo()

    // Get available students for the selected class
    const availableStudents = mode === 'create' && selectedClassId
        ? students.filter((s) => {
            const cls = classes.find((c) => c.id === selectedClassId)
            return cls?.studentIds.includes(s.id)
        })
        : []

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (mode === 'edit') {
                await onSave({ date, time, status, remarks })
            } else if (onCreate) {
                await onCreate({
                    classId: selectedClassId,
                    studentId: selectedStudentId,
                    date,
                    time: time || undefined,
                    status,
                    remarks: remarks || undefined,
                })
            }
            onClose()
        } catch (error) {
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {mode === 'edit' ? 'Edit Attendance' : 'Add Attendance Entry'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'create' ? (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Class
                                </label>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => {
                                        setSelectedClassId(e.target.value)
                                        setSelectedStudentId('')
                                    }}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                >
                                    <option value="">Select a class</option>
                                    {classes.map((cls) => {
                                        const teacher = teachers.find((t) => t.id === cls.teacherId)
                                        const instrument = instruments.find((i) => i.id === cls.instrumentId)
                                        return (
                                            <option key={cls.id} value={cls.id}>
                                                {instrument?.name} - {teacher?.name} ({cls.weekday} {cls.startTime})
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>

                            {selectedClassId && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Student
                                    </label>
                                    <select
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                    >
                                        <option value="">Select a student</option>
                                        {availableStudents.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Teacher:</span>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{classInfo?.teacher || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 dark:text-slate-400">Instrument:</span>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{classInfo?.instrument || '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-500 dark:text-slate-400">Student:</span>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{classInfo?.student || '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Time
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Remarks
                        </label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={3}
                            placeholder="Optional notes..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
