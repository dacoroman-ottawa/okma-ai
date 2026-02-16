"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePeople } from "@/hooks/usePeople";
import { TeacherDetail } from "@/components/people";
import type { Teacher } from "@/types/people";

function toCamel(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamel(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [key.replace(/(_\w)/g, k => k[1].toUpperCase())]: toCamel(obj[key]),
            }),
            {},
        );
    }
    return obj;
}

export default function TeacherDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { instruments, enrollments, students } = usePeople();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <TeacherDetail
            teacher={teacher}
            instruments={instruments}
            availability={teacher.availability || []}
            enrollments={enrollments}
            students={students}
            onBack={() => router.back()}
            onEdit={() => console.log("Edit Teacher", id)}
            onDelete={() => console.log("Delete Teacher", id)}
            onViewStudent={(studentId) => router.push(`/people/students/${studentId}`)}
        />
    );
}
