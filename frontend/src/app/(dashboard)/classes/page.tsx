"use client"

import { ClassesView } from "@/components/classes"
import { useClasses } from "@/hooks/useClasses"
import { usePeople } from "@/hooks/usePeople"

export default function ClassesPage() {
    const {
        classes,
        loading: classesLoading,
        markAttendance,
        createClass,
        updateClass
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
            attendanceRecords={[]} // For now, passing empty or we could merge from useClasses
            teacherAvailability={teacherAvailability}
            studentAvailability={studentAvailability}
            onMarkAttendance={markAttendance}
            onCreateClass={createClass}
            onUpdateClass={updateClass}
            onViewClass={(id) => console.log("View Class", id)}
            onRescheduleClass={(id) => console.log("Reschedule Class", id)}
            onCancelClass={(id) => console.log("Cancel Class", id)}
        />
    )
}
