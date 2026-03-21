'use client'

import { AttendanceView } from '@/components/attendance'
import { useClasses } from '@/hooks/useClasses'
import { usePeople } from '@/hooks/usePeople'
import type { AttendanceStatus } from '@/types/classes'

export default function AttendancePage() {
    const {
        classes,
        attendanceRecords,
        loading: classesLoading,
        weekStart,
        weekEnd,
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
        updateAttendance,
        createAttendance,
        generateWeekAttendance,
    } = useClasses()

    const { teachers, students, instruments, loading: peopleLoading } = usePeople()

    const handleStatusChange = async (recordId: string, status: AttendanceStatus) => {
        await updateAttendance(recordId, { status })
    }

    const handleUpdateRecord = async (
        recordId: string,
        data: { date?: string; time?: string; status?: AttendanceStatus; remarks?: string }
    ) => {
        await updateAttendance(recordId, data)
    }

    const handleCreateRecord = async (data: {
        classId: string
        studentId: string
        date: string
        time?: string
        status?: AttendanceStatus
        remarks?: string
    }) => {
        await createAttendance(data)
    }

    const handleGenerateWeek = async () => {
        await generateWeekAttendance(weekStart)
    }

    if (classesLoading || peopleLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        )
    }

    return (
        <AttendanceView
            records={attendanceRecords}
            classes={classes}
            teachers={teachers.map((t) => ({ id: t.id, name: t.name }))}
            students={students.map((s) => ({ id: s.id, name: s.name }))}
            instruments={instruments}
            weekStart={weekStart}
            weekEnd={weekEnd}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onCurrentWeek={goToCurrentWeek}
            onStatusChange={handleStatusChange}
            onUpdateRecord={handleUpdateRecord}
            onCreateRecord={handleCreateRecord}
            onGenerateWeek={handleGenerateWeek}
        />
    )
}
