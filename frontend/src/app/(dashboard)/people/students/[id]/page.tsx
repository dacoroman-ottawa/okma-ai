"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { usePeople } from "@/hooks/usePeople";
import { StudentDetail, StudentEditModal, AvailabilityEditModal } from "@/components/people";
import { toCamel } from "@/lib/utils";
import type { Student, AvailabilitySlot } from "@/types/people";

export default function StudentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { instruments, enrollments, teachers, updateStudent, updateStudentAvailability } = usePeople();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

    // Open edit modal if ?edit=true is in URL
    useEffect(() => {
        if (searchParams.get("edit") === "true" && student && !loading) {
            setIsEditModalOpen(true);
            // Clear the query param after opening
            router.replace(`/people/students/${id}`, { scroll: false });
        }
    }, [searchParams, student, loading, id, router]);

    useEffect(() => {
        async function fetchDetail() {
            try {
                setLoading(true);
                // 1. Get Admin Token
                const tokenRes = await fetch("http://localhost:8000/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        username: "admin@kanatamusic.com",
                        password: "admin123"
                    })
                });
                const { access_token } = await tokenRes.json();
                const headers = { Authorization: `Bearer ${access_token}` };

                const res = await fetch(`http://localhost:8000/people/students/${id}`, { headers });
                const data = toCamel(await res.json());
                setStudent(data);
                setLoading(false);
            } catch (error) {
                console.error("Fetch detail error:", error);
                setLoading(false);
            }
        }
        fetchDetail();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
                Student not found
            </div>
        );
    }

    const handleSaveStudent = async (data: Partial<Student>) => {
        if (!student) return;
        const updated = await updateStudent(student.id, data);
        setStudent((prev) => prev ? { ...prev, ...updated } : prev);
    };

    const handleSaveAvailability = async (slots: AvailabilitySlot[]) => {
        if (!student) return;
        const updatedSlots = await updateStudentAvailability(student.id, slots);
        setStudent((prev) => prev ? { ...prev, availability: updatedSlots } : prev);
    };

    const handleOpenAvailabilityModal = () => {
        setIsEditModalOpen(false);
        setIsAvailabilityModalOpen(true);
    };

    return (
        <>
            <StudentDetail
                student={student}
                instruments={instruments}
                availability={student.availability || []}
                enrollments={enrollments}
                teachers={teachers}
                onBack={() => router.push("/people")}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={() => console.log("Delete Student", id)}
                onViewTeacher={(teacherId) => router.push(`/people/teachers/${teacherId}`)}
            />
            <StudentEditModal
                student={student}
                instruments={instruments}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveStudent}
                onEditAvailability={handleOpenAvailabilityModal}
            />
            <AvailabilityEditModal
                slots={student.availability || []}
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                onSave={handleSaveAvailability}
            />
        </>
    );
}
