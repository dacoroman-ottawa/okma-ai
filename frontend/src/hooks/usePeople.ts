"use client";

import { useState, useEffect } from "react";
import type { Teacher, Student, Instrument, Enrollment, AvailabilitySlot } from "@/types/people";

import { toCamel } from "@/lib/utils";

export function usePeople() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [teacherAvailability, setTeacherAvailability] = useState<Record<string, AvailabilitySlot[]>>({});
    const [studentAvailability, setStudentAvailability] = useState<Record<string, AvailabilitySlot[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
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

                // 2. Fetch Data
                const headers = { Authorization: `Bearer ${access_token}` };

                const [tchRes, stuRes, instRes] = await Promise.all([
                    fetch("http://localhost:8000/people/teachers", { headers }),
                    fetch("http://localhost:8000/people/students", { headers }),
                    fetch("http://localhost:8000/people/instruments", { headers })
                ]);

                const tchData = toCamel(await tchRes.json());
                const stuData = toCamel(await stuRes.json());
                const instData = toCamel(await instRes.json());

                setTeachers(tchData);
                setStudents(stuData);
                setInstruments(instData);

                // Map availability for students (as they are in the list)
                const stuAvail: Record<string, AvailabilitySlot[]> = {};
                stuData.forEach((s: any) => {
                    if (s.availability) stuAvail[s.id] = s.availability;
                });
                setStudentAvailability(stuAvail);

                // For teachers, the list endpoint currently includes instrumentsTaught
                // We'll need another fetch for full availability if not in list

                setLoading(false);
            } catch (error) {
                console.error("Fetch error:", error);
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const getAuthToken = async () => {
        const tokenRes = await fetch("http://localhost:8000/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                username: "admin@kanatamusic.com",
                password: "admin123"
            })
        });
        const { access_token } = await tokenRes.json();
        return access_token;
    };

    const updateTeacher = async (id: string, data: any) => {
        const token = await getAuthToken();
        const res = await fetch(`http://localhost:8000/people/teachers/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to update teacher");
        }

        const updatedTeacher = toCamel(await res.json());

        // Update local state
        setTeachers((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updatedTeacher } : t))
        );

        return updatedTeacher;
    };

    const updateStudent = async (id: string, data: any) => {
        const token = await getAuthToken();
        const res = await fetch(`http://localhost:8000/people/students/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to update student");
        }

        const updatedStudent = toCamel(await res.json());

        // Update local state
        setStudents((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...updatedStudent } : s))
        );

        return updatedStudent;
    };

    const updateTeacherAvailability = async (id: string, slots: AvailabilitySlot[]) => {
        const token = await getAuthToken();
        const res = await fetch(`http://localhost:8000/people/teachers/${id}/availability`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ slots })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to update availability");
        }

        const result = toCamel(await res.json());

        // Update local teacher availability state
        setTeacherAvailability((prev) => ({
            ...prev,
            [id]: result.availability
        }));

        return result.availability;
    };

    return {
        teachers,
        students,
        instruments,
        enrollments,
        teacherAvailability,
        studentAvailability,
        loading,
        addTeacher: async (data: any) => console.log("Add Teacher", data),
        updateTeacher,
        updateTeacherAvailability,
        deleteTeacher: async (id: string) => console.log("Delete Teacher", id),
        addStudent: async (data: any) => console.log("Add Student", data),
        updateStudent,
        deleteStudent: async (id: string) => console.log("Delete Student", id),
    };
}
