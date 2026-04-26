"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { usePeople } from "@/hooks/usePeople";
import { TeacherDetail, TeacherEditModal, AvailabilityEditModal } from "@/components/people";
import { toCamel, getAuthToken, API_BASE_URL } from "@/lib/utils";
import type { Teacher, AvailabilitySlot } from "@/types/people";

export default function TeacherDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { instruments, enrollments, students, updateTeacher, updateTeacherAvailability } = usePeople();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

    // Open edit modal if ?edit=true is in URL
    useEffect(() => {
        if (searchParams.get("edit") === "true" && teacher && !loading) {
            setIsEditModalOpen(true);
            // Clear the query param after opening
            router.replace(`/people/teachers/${id}`, { scroll: false });
        }
    }, [searchParams, teacher, loading, id, router]);

    useEffect(() => {
        async function fetchDetail() {
            try {
                setLoading(true);
                const token = getAuthToken();
                const headers = { Authorization: `Bearer ${token}` };

                const res = await fetch(`${API_BASE_URL}/people/teachers/${id}`, { headers });
                const data = toCamel(await res.json());
                setTeacher(data);
                setLoading(false);
            } catch (error) {
                console.error("Fetch detail error:", error);
                setLoading(false);
            }
        }
        fetchDetail();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (!teacher) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500">
                Teacher not found
            </div>
        );
    }

    const handleSaveTeacher = async (data: Partial<Teacher>) => {
        if (!teacher) return;
        const updated = await updateTeacher(teacher.id, data);
        setTeacher((prev) => prev ? { ...prev, ...updated } : prev);
    };

    const handleSaveAvailability = async (slots: AvailabilitySlot[]) => {
        if (!teacher) return;
        const updatedSlots = await updateTeacherAvailability(teacher.id, slots);
        setTeacher((prev) => prev ? { ...prev, availability: updatedSlots } : prev);
    };

    const handleOpenAvailabilityModal = () => {
        setIsEditModalOpen(false);
        setIsAvailabilityModalOpen(true);
    };

    return (
        <>
            <TeacherDetail
                teacher={teacher}
                instruments={instruments}
                availability={teacher.availability || []}
                enrollments={enrollments}
                students={students}
                onBack={() => router.push("/people")}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={() => console.log("Delete Teacher", id)}
                onViewStudent={(studentId) => router.push(`/people/students/${studentId}`)}
            />
            <TeacherEditModal
                teacher={teacher}
                instruments={instruments}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveTeacher}
                onEditAvailability={handleOpenAvailabilityModal}
            />
            <AvailabilityEditModal
                slots={teacher.availability || []}
                isOpen={isAvailabilityModalOpen}
                onClose={() => setIsAvailabilityModalOpen(false)}
                onSave={handleSaveAvailability}
            />
        </>
    );
}
