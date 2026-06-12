'use client'

import { Search, Filter, X, AlertCircle, AlertTriangle, Info, Bug } from 'lucide-react'
import { useState } from 'react'

interface FiltersProps {
  filters: {
    search: string
    level: string
    resolved: string
  }
  onSearch: (search: string) => void
  onFilterChange: (key: string, value: string) => void
}

export default function Filters({ filters, onSearch, onFilterChange }: FiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const levelOptions = [
    { value: 'error', label: 'Error', icon: AlertCircle, color: 'text-red-400' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-yellow-400' },
    { value: 'info', label: 'Info', icon: Info, color: 'text-blue-400' },
    { value: 'debug', label: 'Debug', icon: Bug, color: 'text-gray-400' },
  ]

  const hasActiveFilters = filters.level || filters.resolved || filters.search

  return (
    <div className="space-y-3">
      {/* Main search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-errtrace-dark-400" />
          <input
            type="text"
            placeholder="Search errors by message, URL, or stack trace..."
            value={filters.search}
            onChange={(e) => onSearch(e.target.value)}
            className="input pl-10 w-full"
          />
          {filters.search && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-errtrace-dark-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`btn flex items-center space-x-2 ${
              showAdvanced || hasActiveFilters
                ? 'bg-errtrace-primary text-white'
                : 'bg-errtrace-dark-800 text-errtrace-dark-300 hover:text-white'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {[
                  filters.level ? 1 : 0,
                  filters.resolved ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={() => {
                onFilterChange('level', '')
                onFilterChange('resolved', '')
              }}
              className="btn bg-errtrace-dark-800 text-errtrace-dark-300 hover:text-white flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="card space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Advanced Filters</h3>
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-errtrace-dark-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Level filter */}
            <div>
              <label className="block text-sm text-errtrace-dark-400 mb-2">Level</label>
              <div className="flex flex-wrap gap-2">
                {levelOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => onFilterChange('level', filters.level === option.value ? '' : option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                        filters.level === option.value
                          ? 'bg-errtrace-dark-700 text-white ring-2 ring-errtrace-primary'
                          : 'bg-errtrace-dark-800 text-errtrace-dark-300 hover:text-white hover:bg-errtrace-dark-700'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${option.color}`} />
                      <span>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm text-errtrace-dark-400 mb-2">Status</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onFilterChange('resolved', filters.resolved === '0' ? '' : '0')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filters.resolved === '0'
                      ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500'
                      : 'bg-errtrace-dark-800 text-errtrace-dark-300 hover:text-white'
                  }`}
                >
                  Unresolved
                </button>
                <button
                  onClick={() => onFilterChange('resolved', filters.resolved === '1' ? '' : '1')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filters.resolved === '1'
                      ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500'
                      : 'bg-errtrace-dark-800 text-errtrace-dark-300 hover:text-white'
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && !showAdvanced && (
        <div className="flex flex-wrap gap-2">
          {filters.level && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-errtrace-dark-800 text-errtrace-dark-300 text-xs rounded-lg">
              <span>Level: {filters.level}</span>
              <button onClick={() => onFilterChange('level', '')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.resolved && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-errtrace-dark-800 text-errtrace-dark-300 text-xs rounded-lg">
              <span>Status: {filters.resolved === '0' ? 'Unresolved' : 'Resolved'}</span>
              <button onClick={() => onFilterChange('resolved', '')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}