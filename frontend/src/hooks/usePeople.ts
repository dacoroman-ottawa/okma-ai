"use client";

import { useState, useEffect } from "react";
import type { Teacher, Student, Instrument, Enrollment, AvailabilitySlot } from "@/types/people";

// Mock data based on sample-data.json for initial integration
const MOCK_DATA = {
    teachers: [
        {
            id: "tch-001",
            name: "Margaret Chen",
            address: "45 Maple Grove Drive, Kanata, ON K2K 1X3",
            email: "margaret.chen@email.com",
            primaryContact: "613-555-0142",
            dateOfBirth: "1978-03-15",
            active: true,
            biography: "Margaret has been teaching piano for over 20 years...",
            specialization: "Classical Piano",
            qualification: "Master",
            dateOfEnrollment: "2018-09-01",
            socialInsuranceNumber: "123-456-789",
            hourlyRate: 65,
            instrumentsTaught: ["inst-001"]
        }
    ],
    instruments: [{ id: "inst-001", name: "Piano" }],
    students: [],
    enrollments: [],
    teacherAvailability: { "tch-001": [] },
    studentAvailability: {}
};

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
                // 1. Get Admin Token (Mocking login for now)
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

                const [tchRes, stuRes] = await Promise.all([
                    fetch("http://localhost:8000/people/teachers", { headers }),
                    fetch("http://localhost:8000/people/students", { headers })
                ]);

                const tchData = await tchRes.json();
                const stuData = await stuRes.json();

                setTeachers(tchData);
                setStudents(stuData);

                // Mocking instruments for now
                setInstruments([{ id: "inst-001", name: "Piano" }]);
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
