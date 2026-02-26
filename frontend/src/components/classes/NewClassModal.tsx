"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import type { Weekday, ClassType, Duration, Class } from "@/types/classes";
import { AvailabilityPicker } from "./AvailabilityPicker";

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface Teacher {
  id: string;
  name: string;
  instrumentsTaught: string[];
}

interface Student {
  id: string;
  name: string;
}

interface Instrument {
  id: string;
  name: string;
}

interface NewClassModalProps {
  teachers: Teacher[];
  students: Student[];
  instruments: Instrument[];
  teacherAvailability?: Record<string, AvailabilitySlot[]>;
  studentAvailability?: Record<string, AvailabilitySlot[]>;
  existingClasses?: Class[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    teacherId: string;
    instrumentId: string;
    studentIds: string[];
    type: ClassType;
    weekday: Weekday;
    startTime: string;
    duration: number;
    frequency: number;
    notes?: string;
  }) => Promise<void>;
}

const WEEKDAYS: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DURATIONS: Duration[] = [30, 45, 60];

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});

export function NewClassModal({
  teachers,
  students,
  instruments,
  teacherAvailability = {},
  studentAvailability = {},
  existingClasses = [],
  isOpen,
  onClose,
  onSave,
}: NewClassModalProps) {
  const [formData, setFormData] = useState({
    teacherId: "",
    instrumentId: "",
    studentIds: [] as string[],
    type: "private" as ClassType,
    weekday: "Monday" as Weekday,
    startTime: "09:00",
    duration: 60 as number,
    frequency: 1,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        teacherId: "",
        instrumentId: "",
        studentIds: [],
        type: "private",
        weekday: "Monday",
        startTime: "09:00",
        duration: 60,
        frequency: 1,
        notes: "",
      });
      setError(null);
      setShowAvailability(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!formData.teacherId) {
      setError("Please select a teacher");
      setSaving(false);
      return;
    }
    if (!formData.instrumentId) {
      setError("Please select an instrument");
      setSaving(false);
      return;
    }
    if (formData.studentIds.length === 0) {
      setError("Please select at least one student");
      setSaving(false);
      return;
    }

    try {
      await onSave({
        ...formData,
        notes: formData.notes || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create class");
    } finally {
      setSaving(false);
    }
  };

  const handleAddStudent = () => {
    const availableStudent = students.find(
      (s) => !formData.studentIds.includes(s.id)
    );
    if (availableStudent) {
      setFormData((prev) => ({
        ...prev,
        studentIds: [...prev.studentIds, availableStudent.id],
      }));
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      studentIds: prev.studentIds.filter((id) => id !== studentId),
    }));
  };

  const handleUpdateStudent = (index: number, studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      studentIds: prev.studentIds.map((id, i) =>
        i === index ? studentId : id
      ),
    }));
  };

  // Bidirectional filtering between teachers and instruments
  const availableTeachers = formData.instrumentId
    ? teachers.filter((teacher) =>
        teacher.instrumentsTaught?.includes(formData.instrumentId)
      )
    : teachers;

  const availableInstruments = formData.teacherId
    ? instruments.filter((inst) => {
        const teacher = teachers.find((t) => t.id === formData.teacherId);
        return teacher?.instrumentsTaught?.includes(inst.id);
      })
    : instruments;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            New Class
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Class Type */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Class Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="private"
                    checked={formData.type === "private"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as ClassType,
                        studentIds: prev.studentIds.slice(0, 1),
                      }))
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Private (1 student)
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="group"
                    checked={formData.type === "group"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as ClassType,
                      }))
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Group (multiple students)
                  </span>
                </label>
              </div>
            </div>

            {/* Instrument */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Instrument *
              </label>
              <select
                required
                value={formData.instrumentId}
                onChange={(e) => {
                  const newInstrumentId = e.target.value;
                  setFormData((prev) => {
                    // Check if current teacher teaches the new instrument
                    const currentTeacher = teachers.find((t) => t.id === prev.teacherId);
                    const teacherTeachesInstrument = currentTeacher?.instrumentsTaught?.includes(newInstrumentId);
                    return {
                      ...prev,
                      instrumentId: newInstrumentId,
                      // Reset teacher if they don't teach this instrument
                      teacherId: teacherTeachesInstrument ? prev.teacherId : "",
                    };
                  });
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Select an instrument</option>
                {availableInstruments.map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Teacher *
              </label>
              <select
                required
                value={formData.teacherId}
                onChange={(e) => {
                  const newTeacherId = e.target.value;
                  setFormData((prev) => {
                    // Check if new teacher teaches the current instrument
                    const newTeacher = teachers.find((t) => t.id === newTeacherId);
                    const teacherTeachesInstrument = newTeacher?.instrumentsTaught?.includes(prev.instrumentId);
                    return {
                      ...prev,
                      teacherId: newTeacherId,
                      // Reset instrument if teacher doesn't teach it
                      instrumentId: teacherTeachesInstrument ? prev.instrumentId : "",
                    };
                  });
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Select a teacher</option>
                {availableTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Weekday */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Day *
              </label>
              <select
                required
                value={formData.weekday}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    weekday: e.target.value as Weekday,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {WEEKDAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Start Time *
              </label>
              <select
                required
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Duration *
              </label>
              <select
                required
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {DURATIONS.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} minutes
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    frequency: parseInt(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value={1}>Weekly</option>
                <option value={2}>Bi-weekly</option>
              </select>
            </div>

            {/* Students */}
            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Students *
                </label>
                {(formData.type === "group" || formData.studentIds.length === 0) && (
                  <button
                    type="button"
                    onClick={handleAddStudent}
                    disabled={formData.studentIds.length >= students.length || (formData.type === "private" && formData.studentIds.length >= 1)}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900"
                  >
                    <Plus className="h-3 w-3" />
                    Add Student
                  </button>
                )}
              </div>

              {formData.studentIds.length > 0 ? (
                <div className="space-y-2">
                  {formData.studentIds.map((studentId, index) => (
                    <div key={`${studentId}-${index}`} className="flex items-center gap-2">
                      <select
                        value={studentId}
                        onChange={(e) => handleUpdateStudent(index, e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      >
                        {students.map((student) => (
                          <option
                            key={student.id}
                            value={student.id}
                            disabled={
                              formData.studentIds.includes(student.id) &&
                              student.id !== studentId
                            }
                          >
                            {student.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(studentId)}
                        className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  No students added yet
                </p>
              )}
            </div>

            {/* Weekly Availability Section */}
            {(formData.teacherId || formData.studentIds.length > 0) && (
              <div className="sm:col-span-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <button
                    type="button"
                    onClick={() => setShowAvailability(!showAvailability)}
                    className="flex w-full items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Weekly Availability
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        (View common slots & select time)
                      </span>
                    </div>
                    {showAvailability ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </button>

                  {showAvailability && (
                    <div className="border-t border-slate-200 p-4 dark:border-slate-700">
                      <AvailabilityPicker
                        teacherId={formData.teacherId || null}
                        teacherName={teachers.find((t) => t.id === formData.teacherId)?.name || ""}
                        studentIds={formData.studentIds}
                        studentNames={Object.fromEntries(
                          students.map((s) => [s.id, s.name])
                        )}
                        teacherAvailability={
                          formData.teacherId
                            ? teacherAvailability[formData.teacherId] || []
                            : []
                        }
                        studentAvailability={studentAvailability}
                        existingClasses={existingClasses}
                        selectedDay={formData.weekday}
                        selectedTime={formData.startTime}
                        onSelect={(day, time) => {
                          setFormData((prev) => ({
                            ...prev,
                            weekday: day,
                            startTime: time,
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="Any additional notes for this class..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
