"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { Student, Instrument, SkillLevel } from "@/types/people";

interface StudentEditModalProps {
  student: Student;
  instruments: Instrument[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Student>) => Promise<void>;
}

const SKILL_LEVELS: SkillLevel["level"][] = ["Beginner", "Intermediate", "Advanced"];

export function StudentEditModal({
  student,
  instruments,
  isOpen,
  onClose,
  onSave,
}: StudentEditModalProps) {
  const [formData, setFormData] = useState({
    name: student.name || "",
    email: student.email || "",
    primaryContact: student.primaryContact || "",
    address: student.address || "",
    dateOfBirth: student.dateOfBirth || "",
    active: student.active,
    skillLevels: student.skillLevels || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: student.name || "",
        email: student.email || "",
        primaryContact: student.primaryContact || "",
        address: student.address || "",
        dateOfBirth: student.dateOfBirth || "",
        active: student.active,
        skillLevels: student.skillLevels || [],
      });
      setError(null);
    }
  }, [isOpen, student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkillLevel = () => {
    // Find an instrument not already in skill levels
    const usedInstruments = formData.skillLevels.map((s) => s.instrumentId);
    const availableInstrument = instruments.find(
      (i) => !usedInstruments.includes(i.id)
    );
    if (availableInstrument) {
      setFormData((prev) => ({
        ...prev,
        skillLevels: [
          ...prev.skillLevels,
          { instrumentId: availableInstrument.id, level: "Beginner" as const },
        ],
      }));
    }
  };

  const handleRemoveSkillLevel = (instrumentId: string) => {
    setFormData((prev) => ({
      ...prev,
      skillLevels: prev.skillLevels.filter((s) => s.instrumentId !== instrumentId),
    }));
  };

  const handleUpdateSkillLevel = (
    instrumentId: string,
    field: "instrumentId" | "level",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      skillLevels: prev.skillLevels.map((s) =>
        s.instrumentId === instrumentId
          ? { ...s, [field]: value }
          : s
      ),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Edit Student
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
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone
              </label>
              <input
                type="tel"
                value={formData.primaryContact}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    primaryContact: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateOfBirth: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Address (full width) */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:bg-slate-700 dark:peer-checked:bg-indigo-500" />
              </label>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Active
              </span>
            </div>

            {/* Skill Levels (full width) */}
            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Skill Levels
                </label>
                <button
                  type="button"
                  onClick={handleAddSkillLevel}
                  disabled={formData.skillLevels.length >= instruments.length}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900"
                >
                  <Plus className="h-3 w-3" />
                  Add Instrument
                </button>
              </div>

              {formData.skillLevels.length > 0 ? (
                <div className="space-y-2">
                  {formData.skillLevels.map((skill, index) => (
                    <div
                      key={`${skill.instrumentId}-${index}`}
                      className="flex items-center gap-2"
                    >
                      <select
                        value={skill.instrumentId}
                        onChange={(e) =>
                          handleUpdateSkillLevel(
                            skill.instrumentId,
                            "instrumentId",
                            e.target.value
                          )
                        }
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      >
                        {instruments.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={skill.level}
                        onChange={(e) =>
                          handleUpdateSkillLevel(
                            skill.instrumentId,
                            "level",
                            e.target.value
                          )
                        }
                        className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      >
                        {SKILL_LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillLevel(skill.instrumentId)}
                        className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  No instruments assigned yet
                </p>
              )}
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
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
