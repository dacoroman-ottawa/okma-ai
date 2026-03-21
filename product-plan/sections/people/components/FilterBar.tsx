import { Search, ChevronDown, X } from 'lucide-react'
import { useState } from 'react'
import type { Instrument } from '../types'

interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  instruments: Instrument[]
  selectedInstrument: string | null
  onInstrumentChange: (id: string | null) => void
  activeFilter: 'all' | 'active' | 'inactive'
  onActiveFilterChange: (filter: 'all' | 'active' | 'inactive') => void
  placeholder?: string
}

export function FilterBar({
  searchValue,
  onSearchChange,
  instruments,
  selectedInstrument,
  onInstrumentChange,
  activeFilter,
  onActiveFilterChange,
  placeholder = 'Search by name...',
}: FilterBarProps) {
  const [instrumentOpen, setInstrumentOpen] = useState(false)

  const selectedInstrumentName = selectedInstrument
    ? instruments.find((i) => i.id === selectedInstrument)?.name
    : null

  const hasActiveFilters = selectedInstrument || activeFilter !== 'all'

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search input */}
      <div className="relative flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Instrument dropdown */}
        <div className="relative">
          <button
            onClick={() => setInstrumentOpen(!instrumentOpen)}
            className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
              selectedInstrument
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <span>{selectedInstrumentName || 'Instrument'}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {instrumentOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setInstrumentOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <button
                  onClick={() => {
                    onInstrumentChange(null)
                    setInstrumentOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    !selectedInstrument
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  All Instruments
                </button>
                {instruments.map((instrument) => (
                  <button
                    key={instrument.id}
                    onClick={() => {
                      onInstrumentChange(instrument.id)
                      setInstrumentOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      selectedInstrument === instrument.id
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {instrument.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Active/Inactive toggle */}
        <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onActiveFilterChange(filter)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              onInstrumentChange(null)
              onActiveFilterChange('all')
            }}
            className="flex h-10 items-center gap-1 rounded-lg px-3 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
