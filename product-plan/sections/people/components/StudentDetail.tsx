import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Music,
  Edit,
  Trash2,
  GraduationCap,
} from 'lucide-react'
import type {
  Student,
  Instrument,
  AvailabilitySlot,
  Enrollment,
  Teacher,
} from '../types'
import { AvailabilityGrid } from './AvailabilityGrid'

interface StudentDetailProps {
  student: Student
  instruments: Instrument[]
  availability: AvailabilitySlot[]
  enrollments: Enrollment[]
  teachers: Teacher[]
  onBack?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onUpdateAvailability?: (slots: AvailabilitySlot[]) => void
  onViewTeacher?: (id: string) => void
}

const levelColors = {
  Beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  Intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  Advanced: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
}

export function StudentDetail({
  student,
  instruments,
  availability,
  enrollments,
  teachers,
  onBack,
  onEdit,
  onDelete,
  onUpdateAvailability,
  onViewTeacher,
}: StudentDetailProps) {
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Get this student's enrollments with teacher and instrument details
  const studentEnrollments = enrollments
    .filter((e) => e.studentId === student.id)
    .map((enrollment) => {
      const teacher = teachers.find((t) => t.id === enrollment.teacherId)
      const instrument = instruments.find((i) => i.id === enrollment.instrumentId)
      return {
        enrollment,
        teacher,
        instrument,
      }
    })
    .filter((e) => e.teacher && e.instrument)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const age = student.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(student.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button and actions */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Profile header */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-3xl font-bold text-white shadow-lg shadow-amber-200 dark:shadow-amber-950">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {student.name}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    student.active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {student.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mb-4 text-lg text-slate-600 dark:text-slate-400">
                {age !== null ? `${age} years old` : 'Age not specified'}
              </p>

              {/* Skill levels */}
              {student.skillLevels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.skillLevels.map((skill) => {
                    const instrumentName = instruments.find(
                      (i) => i.id === skill.instrumentId
                    )?.name
                    return (
                      <span
                        key={skill.instrumentId}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${levelColors[skill.level]}`}
                      >
                        <Music className="h-4 w-4" />
                        {instrumentName} · {skill.level}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  No instruments enrolled yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Contact Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <a
                href={`mailto:${student.email}`}
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {student.email}
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">
                {student.primaryContact}
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm sm:col-span-2">
              <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">
                {student.address}
              </span>
            </div>
            {student.dateOfBirth && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">Born:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {formatDate(student.dateOfBirth)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Weekly Availability
          </h2>
          <AvailabilityGrid slots={availability} />
        </div>

        {/* Enrollments */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Current Enrollments
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {studentEnrollments.length} enrollment
              {studentEnrollments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {studentEnrollments.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {studentEnrollments.map(({ enrollment, teacher, instrument }) => (
                <div
                  key={enrollment.id}
                  onClick={() => onViewTeacher?.(teacher!.id)}
                  className="-mx-2 flex cursor-pointer items-center justify-between rounded-lg px-2 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-sm font-medium text-white">
                      {teacher!.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {teacher!.name}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                          <Music className="h-3 w-3" />
                          {instrument?.name}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {teacher!.specialization}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      ${teacher!.hourlyRate}/hr
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Since {formatDate(enrollment.startDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <GraduationCap className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No current enrollments
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
