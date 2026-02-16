"use client"

import { useState, useEffect } from "react"
import type { Class, AttendanceRecord } from "@/types/classes"
import { toCamel, toSnake } from "@/lib/utils"

export function useClasses() {
    const [classes, setClasses] = useState<Class[]>([])
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchClasses() {
        try {
            setLoading(true)
            // Get Token (using same logic as usePeople for simplicity in this milestone)
            const tokenRes = await fetch("http://localhost:8000/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    username: "admin@kanatamusic.com",
                    password: "admin123",
                }),
            })
            const { access_token } = await tokenRes.json()
            const headers = { Authorization: `Bearer ${access_token}` }

            const [clsRes, attRes] = await Promise.all([
                fetch("http://localhost:8000/classes/", { headers }),
                fetch("http://localhost:8000/classes/attendance", { headers }),
            ])

            const clsData = toCamel(await clsRes.json())
            const attData = toCamel(await attRes.json())

            setClasses(clsData)
            setAttendanceRecords(attData)
            setLoading(false)
        } catch (error) {
            console.error("Fetch classes error:", error)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClasses()
    }, [])

    const markAttendance = async (classId: string, studentId: string, date: string, attended: boolean) => {
        try {
            const tokenRes = await fetch("http://localhost:8000/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    username: "admin@kanatamusic.com",
                    password: "admin123",
                }),
            })
            const { access_token } = await tokenRes.json()
            const headers = {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json"
            }

            const res = await fetch(`http://localhost:8000/classes/${classId}/attendance`, {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake({ studentId, date, attended }))
            })

            if (res.ok) {
                // Refresh data
                await fetchClasses()
            }
        } catch (error) {
            console.error("Mark attendance error:", error)
        }
    }

    return {
        classes,
        attendanceRecords,
        loading,
        refreshClasses: fetchClasses,
        markAttendance,
        createClass: async (data: any) => {
            console.log("Create Class", data)
            // Implementation for creating class will go here
        }
    }
}
