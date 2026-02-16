"use client";

import { useParams, useRouter } from "next/navigation";
import { usePeople } from "@/hooks/usePeople";
import { TeacherDetail } from "@/components/people";

export default function TeacherDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { teachers, instruments, teacherAvailability, enrollments, students } = usePeople();

    const teacher = teachers.find((t) => t.id === id);

    if (!teacher) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
                Teacher not found
            </div>
        );
    }

    return (
        <TeacherDetail
            teacher={teacher}
            instruments={instruments}
            availability={teacherAvailability[teacher.id] || []}
            enrollments={enrollments}
            students={students}
            onBack={() => router.back()}
            onEdit={() => console.log("Edit Teacher", id)}
            onDelete={() => console.log("Delete Teacher", id)}
            onViewStudent={(studentId) => router.push(`/people/students/${studentId}`)}
        />
    );
}
