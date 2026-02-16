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

    return {
        teachers,
        students,
        instruments,
        enrollments,
        teacherAvailability,
        studentAvailability,
        loading,
        addTeacher: async (data: any) => console.log("Add Teacher", data),
        updateTeacher: async (id: string, data: any) => console.log("Update Teacher", id, data),
        deleteTeacher: async (id: string) => console.log("Delete Teacher", id),
    };
}
