"use client";

import { useState, useEffect } from "react";
import type { Teacher, Student, Instrument, Enrollment, AvailabilitySlot } from "@/types/people";

import { toCamel, getAuthToken, API_BASE_URL } from "@/lib/utils";

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
                const token = getAuthToken();
                const headers = { Authorization: `Bearer ${token}` };

                const [tchRes, stuRes, instRes, enrRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/people/teachers`, { headers }),
                    fetch(`${API_BASE_URL}/people/students`, { headers }),
                    fetch(`${API_BASE_URL}/people/instruments`, { headers }),
                    fetch(`${API_BASE_URL}/people/enrollments`, { headers })
                ]);

                const tchData = toCamel(await tchRes.json());
                const stuData = toCamel(await stuRes.json());
                const instData = toCamel(await instRes.json());
                const enrData = toCamel(await enrRes.json());

                setTeachers(tchData);
                setStudents(stuData);
                setInstruments(instData);
                setEnrollments(enrData);

                // Map availability for students (as they are in the list)
                const stuAvail: Record<string, AvailabilitySlot[]> = {};
                stuData.forEach((s: any) => {
                    if (s.availability) stuAvail[s.id] = s.availability;
                });
                setStudentAvailability(stuAvail);

                // Map availability for teachers
                const tchAvail: Record<string, AvailabilitySlot[]> = {};
                tchData.forEach((t: any) => {
                    if (t.availability) tchAvail[t.id] = t.availability;
                });
                setTeacherAvailability(tchAvail);

                setLoading(false);
            } catch (error) {
                console.error("Fetch error:", error);
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const updateTeacher = async (id: string, data: any) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/people/teachers/${id}`, {
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
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/people/students/${id}`, {
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
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/people/teachers/${id}/availability`, {
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

    const updateStudentAvailability = async (id: string, slots: AvailabilitySlot[]) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/people/students/${id}/availability`, {
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

        // Update local student availability state
        setStudentAvailability((prev) => ({
            ...prev,
            [id]: result.availability
        }));

        return result.availability;
    };

    const addTeacher = async (data: Partial<Teacher>) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/people/teachers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to create teacher");
        }

        const newTeacher = toCamel(await res.json());
        setTeachers((prev) => [...prev, newTeacher]);
        return newTeacher;
    };

    const addStudent = async (data: Partial<Student>) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/people/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to create student");
        }

        const newStudent = toCamel(await res.json());
        setStudents((prev) => [...prev, newStudent]);
        return newStudent;
    };

    const deleteTeacher = async (id: string) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/people/teachers/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to delete teacher");
        }

        // Remove from local state
        setTeachers((prev) => prev.filter((t) => t.id !== id));

        // Remove availability
        setTeacherAvailability((prev) => {
            const newAvail = { ...prev };
            delete newAvail[id];
            return newAvail;
        });
    };

    const deleteStudent = async (id: string) => {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/people/students/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Failed to delete student");
        }

        // Remove from local state
        setStudents((prev) => prev.filter((s) => s.id !== id));

        // Remove availability
        setStudentAvailability((prev) => {
            const newAvail = { ...prev };
            delete newAvail[id];
            return newAvail;
        });
    };

    return {
        teachers,
        students,
        instruments,
        enrollments,
        teacherAvailability,
        studentAvailability,
        loading,
        addTeacher,
        updateTeacher,
        updateTeacherAvailability,
        deleteTeacher,
        addStudent,
        updateStudent,
        updateStudentAvailability,
        deleteStudent,
    };
}
