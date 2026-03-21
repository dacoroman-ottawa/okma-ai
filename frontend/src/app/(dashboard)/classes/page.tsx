"use client"

import { ClassesView } from "@/components/classes"
import { useClasses } from "@/hooks/useClasses"
import { usePeople } from "@/hooks/usePeople"

export default function ClassesPage() {
    const {
        classes,
        attendanceRecords,
        loading: classesLoading,
        weekStart,
        weekEnd,
        markAttendance,
        createClass,
        updateClass,
        updateAttendance,
        createAttendance,
        deleteAttendance,
        generateWeekAttendance,
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
    } = useClasses()

    const {
        teachers,
        students,
        instruments,
        teacherAvailability,
        studentAvailability,
        loading: peopleLoading
    } = usePeople()

    const isLoading = classesLoading || peopleLoading

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <ClassesView
            classes={classes}
            teachers={teachers}
            students={students}
            instruments={instruments}
            attendanceRecords={attendanceRecords}
            teacherAvailability={teacherAvailability}
            studentAvailability={studentAvailability}
            onMarkAttendance={markAttendance}
            onCreateClass={createClass}
            onUpdateClass={updateClass}
            onViewClass={(id) => console.log("View Class", id)}
            onRescheduleClass={(id) => console.log("Reschedule Class", id)}
            onCancelClass={(id) => console.log("Cancel Class", id)}
            // Attendance props
            weekStart={weekStart}
            weekEnd={weekEnd}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onCurrentWeek={goToCurrentWeek}
            onUpdateAttendance={updateAttendance}
            onCreateAttendance={createAttendance}
            onDeleteAttendance={deleteAttendance}
            onGenerateWeek={() => generateWeekAttendance(weekStart)}
        />
    )
}
