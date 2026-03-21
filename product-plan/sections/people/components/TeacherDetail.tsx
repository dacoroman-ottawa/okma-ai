import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Music,
  DollarSign,
  GraduationCap,
  Edit,
  Trash2,
  Users,
} from 'lucide-react'
import type {
  Teacher,
  Instrument,
  AvailabilitySlot,
  Enrollment,
  Student,
} from '../types'
import { AvailabilityGrid } from './AvailabilityGrid'

interface TeacherDetailProps {
  teacher: Teacher
  instruments: Instrument[]
  availability: AvailabilitySlot[]
  enrollments: Enrollment[]
  students: Student[]
  onBack?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onUpdateAvailability?: (slots: AvailabilitySlot[]) => void
  onViewStudent?: (id: string) => void
}

export function TeacherDetail({
  teacher,
  instruments,
  availability,
  enrollments,
  students,
  onBack,
  onEdit,
  onDelete,
  onUpdateAvailability,
  onViewStudent,
}: TeacherDetailProps) {
  const initials = teacher.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const instrumentNames = teacher.instrumentsTaught
    .map((id) => instruments.find((i) => i.id === id)?.name)
    .filter(Boolean)

  // Get students enrolled with this teacher
  const teacherEnrollments = enrollments.filter((e) => e.teacherId === teacher.id)
  const enrolledStudents = teacherEnrollments.map((enrollment) => {
    const student = students.find((s) => s.id === enrollment.studentId)
    const instrument = instruments.find((i) => i.id === enrollment.instrumentId)
    return {
      enrollment,
      student,
      instrument,
    }
  }).filter((e) => e.student)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

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
            Back to Teachers
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
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-3xl font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-950">
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {teacher.name}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    teacher.active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {teacher.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mb-4 text-lg text-slate-600 dark:text-slate-400">
                {teacher.specialization}
              </p>

              {/* Instruments */}
              <div className="flex flex-wrap gap-2">
                {instrumentNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                  >
                    <Music className="h-4 w-4" />
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-row gap-4 sm:flex-col sm:items-end sm:gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  ${teacher.hourlyRate}
                </span>
                /hr
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <GraduationCap className="h-4 w-4" />
                <span>{teacher.qualification}</span>
              </div>
            </div>
          </div>

          {/* Biography */}
          {teacher.biography && (
            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
              <p className="text-slate-600 dark:text-slate-400">{teacher.biography}</p>
            </div>
          )}
        </div>

        {/* Contact & Details */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <a
                  href={`mailto:${teacher.email}`}
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {teacher.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {teacher.primaryContact}
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {teacher.address}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Employment Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">Started:</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {formatDate(teacher.dateOfEnrollment)}
                </span>
              </div>
              {teacher.dateOfBirth && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">Born:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {formatDate(teacher.dateOfBirth)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 dark:text-slate-400">SIN:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {teacher.socialInsuranceNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Weekly Availability
          </h2>
          <AvailabilityGrid slots={availability} />
        </div>

        {/* Assigned Students */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Assigned Students
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {enrolledStudents.length} student{enrolledStudents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {enrolledStudents.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrolledStudents.map(({ enrollment, student, instrument }) => (
                <div
                  key={enrollment.id}
                  onClick={() => onViewStudent?.(student!.id)}
                  className="flex cursor-pointer items-center justify-between py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 -mx-2 px-2 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-medium text-white">
                      {student!.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {student!.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Since {formatDate(enrollment.startDate)}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Music className="h-3 w-3" />
                    {instrument?.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No students currently assigned
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
