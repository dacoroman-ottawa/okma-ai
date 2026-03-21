import { useMemo } from 'react'
import { Wallet, Plus, History, AlertCircle } from 'lucide-react'
import type { StudentBalancesProps } from '../types'

export function StudentBalances({
  balances,
  students,
  teachers,
  instruments,
  onViewStudentHistory,
  onAddCredits,
}: StudentBalancesProps) {
  const getStudentName = (id: string) =>
    students.find((s) => s.id === id)?.name ?? 'Unknown Student'

  const getTeacherName = (id: string) =>
    teachers.find((t) => t.id === id)?.name ?? 'Unknown Teacher'

  const getInstrumentName = (id: string) =>
    instruments.find((i) => i.id === id)?.name ?? 'Unknown Instrument'

  // Group balances by student
  const groupedBalances = useMemo(() => {
    const grouped = new Map<
      string,
      { studentId: string; studentName: string; enrollments: typeof balances }
    >()

    for (const balance of balances) {
      const existing = grouped.get(balance.studentId)
      if (existing) {
        existing.enrollments.push(balance)
      } else {
        grouped.set(balance.studentId, {
          studentId: balance.studentId,
          studentName: getStudentName(balance.studentId),
          enrollments: [balance],
        })
      }
    }

    return Array.from(grouped.values()).sort((a, b) =>
      a.studentName.localeCompare(b.studentName)
    )
  }, [balances, students])

  if (balances.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <Wallet className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
          No credit balances yet
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Student credit balances will appear here after credits are purchased.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groupedBalances.map(({ studentId, studentName, enrollments }) => (
        <div
          key={studentId}
          className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
        >
          {/* Student header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                {studentName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {studentName}
              </h3>
            </div>
            <button
              onClick={() => onViewStudentHistory?.(studentId)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              title="View history"
            >
              <History className="h-4 w-4" />
            </button>
          </div>

          {/* Enrollments */}
          <div className="space-y-3">
            {enrollments.map((balance) => {
              const isLow = balance.currentBalance <= 2
              const isEmpty = balance.currentBalance === 0

              return (
                <div
                  key={balance.enrollmentId}
                  className={`rounded-lg border p-3 ${
                    isEmpty
                      ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10'
                      : isLow
                        ? 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10'
                        : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {getInstrumentName(balance.instrumentId)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        with {getTeacherName(balance.teacherId)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {(isLow || isEmpty) && (
                          <AlertCircle
                            className={`h-4 w-4 ${
                              isEmpty
                                ? 'text-red-500'
                                : 'text-amber-500'
                            }`}
                          />
                        )}
                        <span
                          className={`text-lg font-bold ${
                            isEmpty
                              ? 'text-red-600 dark:text-red-400'
                              : isLow
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {balance.currentBalance}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        credits
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Used: {balance.totalUsed}</span>
                      <span>Purchased: {balance.totalPurchased}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isEmpty
                            ? 'bg-red-500'
                            : isLow
                              ? 'bg-amber-500'
                              : 'bg-indigo-500'
                        }`}
                        style={{
                          width: `${balance.totalPurchased > 0 ? (balance.currentBalance / balance.totalPurchased) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Add credits button */}
                  <button
                    onClick={() =>
                      onAddCredits?.(balance.studentId, balance.enrollmentId)
                    }
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Credits
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
