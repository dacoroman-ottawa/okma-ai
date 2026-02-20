"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import type { AvailabilitySlot } from "@/types/people";

interface AvailabilityEditModalProps {
  slots: AvailabilitySlot[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (slots: AvailabilitySlot[]) => Promise<void>;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

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

export function AvailabilityEditModal({
  slots,
  isOpen,
  onClose,
  onSave,
}: AvailabilityEditModalProps) {
  const [filledCells, setFilledCells] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add");

  // Initialize filled cells from slots
  useEffect(() => {
    if (isOpen) {
      const cells = new Set<string>();
      slots.forEach((slot) => {
        const startHour = parseTime(slot.startTime);
        const endHour = parseTime(slot.endTime);
        for (let hour = startHour; hour < endHour; hour++) {
          cells.add(`${slot.day}-${hour}`);
        }
      });
      setFilledCells(cells);
      setError(null);
    }
  }, [isOpen, slots]);

  const toggleCell = useCallback((day: string, hour: number) => {
    const cellKey = `${day}-${hour}`;
    setFilledCells((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cellKey)) {
        newSet.delete(cellKey);
      } else {
        newSet.add(cellKey);
      }
      return newSet;
    });
  }, []);

  const handleCellInteraction = useCallback(
    (day: string, hour: number, isStart: boolean) => {
      const cellKey = `${day}-${hour}`;
      if (isStart) {
        setIsDragging(true);
        const willAdd = !filledCells.has(cellKey);
        setDragMode(willAdd ? "add" : "remove");
        toggleCell(day, hour);
      } else if (isDragging) {
        setFilledCells((prev) => {
          const newSet = new Set(prev);
          if (dragMode === "add") {
            newSet.add(cellKey);
          } else {
            newSet.delete(cellKey);
          }
          return newSet;
        });
      }
    },
    [filledCells, isDragging, dragMode, toggleCell]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Convert filled cells back to slots
  const cellsToSlots = useCallback((): AvailabilitySlot[] => {
    const result: AvailabilitySlot[] = [];

    DAYS.forEach((day) => {
      let startHour: number | null = null;

      HOURS.forEach((hour, index) => {
        const cellKey = `${day}-${hour}`;
        const isFilled = filledCells.has(cellKey);
        const isLastHour = index === HOURS.length - 1;

        if (isFilled && startHour === null) {
          startHour = hour;
        }

        if (startHour !== null && (!isFilled || isLastHour)) {
          const endHour = isFilled && isLastHour ? hour + 1 : hour;
          result.push({
            day: day as AvailabilitySlot["day"],
            startTime: `${startHour.toString().padStart(2, "0")}:00`,
            endTime: `${endHour.toString().padStart(2, "0")}:00`,
          });
          startHour = null;
        }
      });
    });

    return result;
  }, [filledCells]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);

    try {
      const newSlots = cellsToSlots();
      await onSave(newSlots);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save availability");
    } finally {
      setSaving(false);
    }
  };

  const clearAll = () => {
    setFilledCells(new Set());
  };

  const selectWeekdays = () => {
    const cells = new Set<string>();
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day) => {
      for (let hour = 9; hour < 17; hour++) {
        cells.add(`${day}-${hour}`);
      }
    });
    setFilledCells(cells);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
            Edit Weekly Availability
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Click or drag to select available time slots. Click again to remove.
          </p>

          {/* Quick actions */}
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={selectWeekdays}
              className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900"
            >
              Weekdays 9-5
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Clear All
            </button>
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
                    <div
                      className="bg-white p-2 text-right text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                    >
                      {formatHour(hour)}
                    </div>
                    {DAYS.map((day) => {
                      const cellKey = `${day}-${hour}`;
                      const isFilled = filledCells.has(cellKey);

                      return (
                        <div
                          key={cellKey}
                          onMouseDown={() => handleCellInteraction(day, hour, true)}
                          onMouseEnter={() => handleCellInteraction(day, hour, false)}
                          className={`h-8 cursor-pointer select-none transition-colors ${
                            isFilled
                              ? "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                              : "bg-white hover:bg-indigo-100 dark:bg-slate-900 dark:hover:bg-indigo-950"
                          }`}
                          title={`${day} ${formatHour(hour)} - ${formatHour(hour + 1)}`}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-indigo-500 dark:bg-indigo-600" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700" />
              <span>Unavailable</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </div>
    </div>
  );
}
