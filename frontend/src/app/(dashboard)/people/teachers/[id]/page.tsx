"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { usePeople } from "@/hooks/usePeople";
import { TeacherDetail, TeacherEditModal } from "@/components/people";
import { toCamel } from "@/lib/utils";
import type { Teacher } from "@/types/people";

export default function TeacherDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { instruments, enrollments, students, updateTeacher } = usePeople();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

                const res = await fetch(`http://localhost:8000/people/teachers/${id}`, { headers });
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

    return (
        <>
            <TeacherDetail
                teacher={teacher}
                instruments={instruments}
                availability={teacher.availability || []}
                enrollments={enrollments}
                students={students}
                onBack={() => router.back()}
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
            />
        </>
    );
}
