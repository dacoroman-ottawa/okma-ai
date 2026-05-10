"use client"

import { useState, useEffect, useCallback } from "react"
import type { Class, AttendanceRecord, AttendanceStatus } from "@/types/classes"
import { toCamel, toSnake, getAuthHeaders, API_BASE_URL } from "@/lib/utils"

// Helper to get Monday of current week
function getWeekStart(d: Date = new Date()): Date {
    const date = new Date(d)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
    date.setDate(diff)
    date.setHours(0, 0, 0, 0)
    return date
}

// Helper to get Sunday of current week
function getWeekEnd(weekStart: Date): Date {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + 6)
    return date
}

function formatDate(d: Date): string {
    return d.toISOString().split('T')[0]
}

export function useClasses() {
    const [classes, setClasses] = useState<Class[]>([])
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart())
    const [weekEnd, setWeekEnd] = useState<Date>(() => getWeekEnd(getWeekStart()))

    async function fetchClasses() {
        try {
            setLoading(true)
            const headers = getAuthHeaders()

            const [clsRes, attRes] = await Promise.all([
                fetch(`${API_BASE_URL}/classes/`, { headers }),
                fetch(`${API_BASE_URL}/classes/attendance`, { headers }),
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

    const fetchWeekAttendance = useCallback(async (start: Date, end: Date) => {
        try {
            const headers = getAuthHeaders()
            const url = `${API_BASE_URL}/classes/attendance?week_start=${formatDate(start)}&week_end=${formatDate(end)}`
            const res = await fetch(url, { headers })
            const data = toCamel(await res.json())
            setAttendanceRecords(data)
        } catch (error) {
            console.error("Fetch week attendance error:", error)
        }
    }, [])

    useEffect(() => {
        fetchClasses()
    }, [])

    // Fetch attendance when week changes
    useEffect(() => {
        fetchWeekAttendance(weekStart, weekEnd)
    }, [weekStart, weekEnd, fetchWeekAttendance])

    const markAttendance = async (
        classId: string,
        studentId: string,
        date: string,
        statusOrAttended: AttendanceStatus | boolean,
        time?: string,
        remarks?: string
    ) => {
        try {
            const headers = getAuthHeaders()

            // Support both old boolean format and new status format
            const status = typeof statusOrAttended === 'boolean'
                ? (statusOrAttended ? 'present' : 'absent')
                : statusOrAttended

            const res = await fetch(`${API_BASE_URL}/classes/${classId}/attendance`, {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake({ studentId, date, status, time, remarks }))
            })

            if (res.ok) {
                await fetchWeekAttendance(weekStart, weekEnd)
            }
        } catch (error) {
            console.error("Mark attendance error:", error)
        }
    }

    const updateAttendance = async (
        attendanceId: string,
        data: { date?: string; time?: string; status?: AttendanceStatus; remarks?: string }
    ) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/classes/attendance/${attendanceId}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(toSnake(data))
            })

            if (res.ok) {
                await fetchWeekAttendance(weekStart, weekEnd)
                return await res.json()
            }
        } catch (error) {
            console.error("Update attendance error:", error)
            throw error
        }
    }

    const createAttendance = async (data: {
        classId: string
        studentId: string
        date: string
        time?: string
        status?: AttendanceStatus
        remarks?: string
    }) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/classes/attendance`, {
                method: "POST",
                headers,
                body: JSON.stringify(toSnake(data))
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.detail || "Failed to create attendance")
            }

            await fetchWeekAttendance(weekStart, weekEnd)
            return await res.json()
        } catch (error) {
            console.error("Create attendance error:", error)
            throw error
        }
    }

    const deleteAttendance = async (attendanceId: string) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/classes/attendance/${attendanceId}`, {
                method: "DELETE",
                headers,
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.detail || "Failed to delete attendance")
            }

            await fetchWeekAttendance(weekStart, weekEnd)
            return await res.json()
        } catch (error) {
            console.error("Delete attendance error:", error)
            throw error
        }
    }

    const generateWeekAttendance = async (weekStartDate: Date) => {
        try {
            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE_URL}/classes/attendance/generate-week`, {
                method: "POST",
                headers,
                body: JSON.stringify({ weekStart: formatDate(weekStartDate) })
            })

            if (res.ok) {
                const result = await res.json()
                await fetchWeekAttendance(weekStart, weekEnd)
                return result
            }
        } catch (error) {
            console.error("Generate week attendance error:", error)
            throw error
        }
    }

    const setWeek = (newWeekStart: Date) => {
        setWeekStart(newWeekStart)
        setWeekEnd(getWeekEnd(newWeekStart))
    }

    const goToPreviousWeek = () => {
        const newStart = new Date(weekStart)
        newStart.setDate(newStart.getDate() - 7)
        setWeek(newStart)
    }

    const goToNextWeek = () => {
        const newStart = new Date(weekStart)
        newStart.setDate(newStart.getDate() + 7)
        setWeek(newStart)
    }

    const goToCurrentWeek = () => {
        setWeek(getWeekStart())
    }

    const createClass = async (data: {
        teacherId: string
        instrumentId: string
        studentIds: string[]
        type: string
        weekday: string
        startTime: string
        duration: number
        frequency?: number
        notes?: string
    }) => {
        try {
            const headers = getAuthHeaders()

            const res = await fetch(`${API_BASE_URL}/classes/`, {
                method: "POST",
                headers,
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                throw new Error("Failed to create class")
            }

            // Refresh data after creating
            await fetchClasses()
            return await res.json()
        } catch (error) {
            console.error("Create class error:", error)
            throw error
        }
    }

    const updateClass = async (id: string, data: {
        teacherId: string
        instrumentId: string
        studentIds: string[]
        type: string
        weekday: string
        startTime: string
        duration: number
        frequency?: number
        notes?: string
    }) => {
        try {
            const headers = getAuthHeaders()

            const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                throw new Error("Failed to update class")
            }

            // Refresh data after updating
            await fetchClasses()
            return await res.json()
        } catch (error) {
            console.error("Update class error:", error)
            throw error
        }
    }

    return {
        classes,
        attendanceRecords,
        loading,
        weekStart,
        weekEnd,
        refreshClasses: fetchClasses,
        fetchWeekAttendance,
        markAttendance,
        updateAttendance,
        createAttendance,
        deleteAttendance,
        generateWeekAttendance,
        setWeek,
        goToPreviousWeek,
        goToNextWeek,
        goToCurrentWeek,
        createClass,
        updateClass
    }
}
