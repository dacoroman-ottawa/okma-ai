"use client";

import { useState, useEffect } from "react";
import { usePeople } from "@/hooks/usePeople";
import { TeachersList, StudentsList } from "@/components/people";
import { useRouter } from "next/navigation";

export default function PeoplePage() {
    const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");

    // Restore last active tab from sessionStorage on mount
    useEffect(() => {
        const savedTab = sessionStorage.getItem("peopleActiveTab");
        if (savedTab === "students" || savedTab === "teachers") {
            setActiveTab(savedTab);
        }
    }, []);

    // Save active tab to sessionStorage when it changes
    const handleTabChange = (tab: "teachers" | "students") => {
        setActiveTab(tab);
        sessionStorage.setItem("peopleActiveTab", tab);
    };
    const { teachers, students, instruments, teacherAvailability, studentAvailability, enrollments } = usePeople();
    const router = useRouter();

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            {/* Tab Switcher */}
            <div className="border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
                <nav className="-mb-px flex gap-8">
                    <button
                        onClick={() => handleTabChange("teachers")}
                        className={`py-4 text-sm font-medium transition-colors ${activeTab === "teachers"
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                    >
                        Teachers
                    </button>
                    <button
                        onClick={() => handleTabChange("students")}
                        className={`py-4 text-sm font-medium transition-colors ${activeTab === "students"
                                ? "border-b-2 border-indigo-600 text-indigo-600"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                    >
                        Students
                    </button>
                </nav>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
                {activeTab === "teachers" ? (
                    <TeachersList
                        teachers={teachers}
                        instruments={instruments}
                        teacherAvailability={teacherAvailability}
                        enrollments={enrollments}
                        students={students}
                        onViewTeacher={(id) => router.push(`/people/teachers/${id}`)}
                        onAddTeacher={() => console.log("Add Teacher Modal")}
                        onEditTeacher={(id) => router.push(`/people/teachers/${id}?edit=true`)}
                    />
                ) : (
                    <StudentsList
                        students={students}
                        instruments={instruments}
                        studentAvailability={studentAvailability}
                        enrollments={enrollments}
                        teachers={teachers}
                        onViewStudent={(id) => router.push(`/people/students/${id}`)}
                        onAddStudent={() => console.log("Add Student Modal")}
                        onEditStudent={(id) => router.push(`/people/students/${id}?edit=true`)}
                    />
                )}
            </div>
        </div>
    );
}
