"use client";

import { useParams, useRouter } from "next/navigation";
import { usePeople } from "@/hooks/usePeople";
import { StudentDetail } from "@/components/people";

export default function StudentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { students, instruments, studentAvailability, enrollments, teachers } = usePeople();

    const student = students.find((s) => s.id === id);

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
                Student not found
            </div>
        );
    }

    return (
        <StudentDetail
            student={student}
            instruments={instruments}
            availability={studentAvailability[student.id] || []}
            enrollments={enrollments}
            teachers={teachers}
            onBack={() => router.back()}
            onEdit={() => console.log("Edit Student", id)}
            onDelete={() => console.log("Delete Student", id)}
            onViewTeacher={(teacherId) => router.push(`/people/teachers/${teacherId}`)}
        />
    );
}
