"use client";

import React, { useMemo } from "react";
import type { Weekday } from "@/types/classes";

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface ClassData {
  id: string;
  teacherId: string;
  studentIds: string[];
  weekday: string;
  startTime: string;
  duration: number;
  status: string;
}

interface AvailabilityPickerProps {
  teacherId: string | null;
  teacherName: string;
  studentIds: string[];
  studentNames: Record<string, string>;
  teacherAvailability: AvailabilitySlot[];
  studentAvailability: Record<string, AvailabilitySlot[]>;
  existingClasses: ClassData[];
  selectedDay: Weekday | null;
  selectedTime: string | null;
  onSelect: (day: Weekday, time: string) => void;
}

const DAYS: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}${suffix}`;
}

function parseTime(time: string): number {
  const [hours] = time.split(":").map(Number);
  return hours;
}

export function AvailabilityPicker({
  teacherId,
  teacherName,
  studentIds,
  studentNames,
  teacherAvailability,
  studentAvailability,
  existingClasses,
  selectedDay,
  selectedTime,
  onSelect,
}: AvailabilityPickerProps) {
  // Convert availability slots to cell sets
  const teacherCells = useMemo(() => {
    const cells = new Set<string>();
    teacherAvailability.forEach((slot) => {
      const startHour = parseTime(slot.startTime);
      const endHour = parseTime(slot.endTime);
      for (let hour = startHour; hour < endHour; hour++) {
        cells.add(`${slot.day}-${hour}`);
      }
    });
    return cells;
  }, [teacherAvailability]);

  // Combined student availability (intersection of all selected students)
  const studentCells = useMemo(() => {
    if (studentIds.length === 0) return new Set<string>();

    // Start with first student's availability
    const firstStudentSlots = studentAvailability[studentIds[0]] || [];
    const cells = new Set<string>();
    firstStudentSlots.forEach((slot) => {
      const startHour = parseTime(slot.startTime);
      const endHour = parseTime(slot.endTime);
      for (let hour = startHour; hour < endHour; hour++) {
        cells.add(`${slot.day}-${hour}`);
      }
    });

    // Intersect with other students
    for (let i = 1; i < studentIds.length; i++) {
      const studentSlots = studentAvailability[studentIds[i]] || [];
      const studentCellSet = new Set<string>();
      studentSlots.forEach((slot) => {
        const startHour = parseTime(slot.startTime);
        const endHour = parseTime(slot.endTime);
        for (let hour = startHour; hour < endHour; hour++) {
          studentCellSet.add(`${slot.day}-${hour}`);
        }
      });

      // Keep only cells that are in both sets
      cells.forEach((cell) => {
        if (!studentCellSet.has(cell)) {
          cells.delete(cell);
        }
      });
    }

    return cells;
  }, [studentIds, studentAvailability]);

  // Common available slots (intersection of teacher and all students)
  const commonCells = useMemo(() => {
    const cells = new Set<string>();
    teacherCells.forEach((cell) => {
      if (studentIds.length === 0 || studentCells.has(cell)) {
        cells.add(cell);
      }
    });
    return cells;
  }, [teacherCells, studentCells, studentIds]);

  // Booked slots from existing classes
  const bookedCells = useMemo(() => {
    const cells = new Set<string>();
    existingClasses
      .filter((cls) => cls.status === "scheduled")
      .filter((cls) => {
        // Check if this class involves the selected teacher or any selected student
        if (teacherId && cls.teacherId === teacherId) return true;
        if (studentIds.some((id) => cls.studentIds.includes(id))) return true;
        return false;
      })
      .forEach((cls) => {
        const startHour = parseTime(cls.startTime);
        const durationHours = Math.ceil(cls.duration / 60);
        for (let hour = startHour; hour < startHour + durationHours; hour++) {
          cells.add(`${cls.weekday}-${hour}`);
        }
      });
    return cells;
  }, [existingClasses, teacherId, studentIds]);

  const getCellStatus = (day: string, hour: number) => {
    const cellKey = `${day}-${hour}`;
    const isTeacherAvailable = teacherCells.has(cellKey);
    // Only mark as student available if students are actually selected AND they're available
    const isStudentAvailable = studentIds.length > 0 && studentCells.has(cellKey);
    // Common only when both teacher AND students are available (and students are selected)
    const isCommon = studentIds.length > 0
      ? (isTeacherAvailable && isStudentAvailable)
      : isTeacherAvailable; // If no students, teacher availability is selectable
    const isBooked = bookedCells.has(cellKey);
    const isSelected = selectedDay === day && selectedTime === `${hour.toString().padStart(2, "0")}:00`;

    return { isTeacherAvailable, isStudentAvailable, isCommon, isBooked, isSelected };
  };

  const handleCellClick = (day: string, hour: number) => {
    const { isCommon, isBooked } = getCellStatus(day, hour);
    if (isCommon && !isBooked) {
      onSelect(day as Weekday, `${hour.toString().padStart(2, "0")}:00`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-blue-400 dark:bg-blue-500" />
          <span>Teacher ({teacherName || "Not selected"})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-amber-400 dark:bg-amber-500" />
          <span>Students ({studentIds.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-emerald-500 dark:bg-emerald-600" />
          <span>Common (selectable)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-400 dark:bg-red-500" />
          <span>Already booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-indigo-600 ring-2 ring-indigo-300" />
          <span>Selected</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header row with days */}
          <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700">
            <div className="bg-slate-50 p-2 dark:bg-slate-900" />
            {DAYS.map((day) => (
              <div
                key={day}
                className="bg-slate-50 p-2 text-center text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-400"
              >
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Time rows */}
          <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700">
            {HOURS.map((hour) => (
              <React.Fragment key={hour}>
                <div className="bg-white p-2 text-right text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  {formatHour(hour)}
                </div>
                {DAYS.map((day) => {
                  const { isTeacherAvailable, isStudentAvailable, isCommon, isBooked, isSelected } =
                    getCellStatus(day, hour);

                  let bgClass = "bg-white dark:bg-slate-900"; // Default: unavailable
                  let cursorClass = "cursor-default";
                  let title = "Unavailable";

                  if (isBooked) {
                    bgClass = "bg-red-400 dark:bg-red-500";
                    title = "Already booked";
                  } else if (isSelected) {
                    bgClass = "bg-indigo-600 ring-2 ring-indigo-300 dark:bg-indigo-500";
                    cursorClass = "cursor-pointer";
                    title = "Selected";
                  } else if (isCommon) {
                    bgClass = "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500";
                    cursorClass = "cursor-pointer";
                    title = "Available - Click to select";
                  } else if (isTeacherAvailable && !isStudentAvailable) {
                    bgClass = "bg-blue-400 dark:bg-blue-500";
                    title = `${teacherName} available, students not available`;
                  } else if (!isTeacherAvailable && isStudentAvailable) {
                    bgClass = "bg-amber-400 dark:bg-amber-500";
                    title = `Students available, ${teacherName || "teacher"} not available`;
                  }

                  return (
                    <div
                      key={`${day}-${hour}`}
                      onClick={() => handleCellClick(day, hour)}
                      className={`h-8 select-none transition-colors ${bgClass} ${cursorClass}`}
                      title={`${day} ${formatHour(hour)} - ${formatHour(hour + 1)}: ${title}`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Help text */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Click on a green slot to select a time for the class. Only slots where both teacher and all students are available can be selected.
      </p>
    </div>
  );
}
