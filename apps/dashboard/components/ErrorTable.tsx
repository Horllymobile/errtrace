'use client'

import { useState } from 'react'
import { ErrorLog } from '@/lib/types'
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Bug, 
  Eye, 
  CheckCircle, 
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  Monitor
} from 'lucide-react'

interface ErrorTableProps {
  errors: ErrorLog[]
  loading: boolean
  onView: (id: string) => void
  onResolve: (id: string) => void
  onDelete: (id: string) => void
}

export default function ErrorTable({ errors, loading, onView, onResolve, onDelete }: ErrorTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const toggleSelectAll = () => {
    if (selectedErrors.size === errors.length) {
      setSelectedErrors(new Set())
    } else {
      setSelectedErrors(new Set(errors.map(e => e.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedErrors)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedErrors(newSelected)
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case 'info': return <Info className="h-4 w-4 text-blue-400" />
      case 'debug': return <Bug className="h-4 w-4 text-gray-400" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'warning': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'info': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'debug': return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4">
              <div className="h-4 bg-errtrace-dark-700 rounded w-16" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-errtrace-dark-700 rounded w-3/4" />
                <div className="h-3 bg-errtrace-dark-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (errors.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-errtrace-dark-800 mb-4">
          <Bug className="h-8 w-8 text-errtrace-dark-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No errors found</h3>
        <p className="text-errtrace-dark-400">
          Your application is running smoothly!
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {/* Bulk actions */}
      {selectedErrors.size > 0 && (
        <div className="px-6 py-3 bg-errtrace-primary/10 border-b border-errtrace-dark-700 flex items-center space-x-3">
          <span className="text-sm text-errtrace-primary">
            {selectedErrors.size} selected
          </span>
          <button
            onClick={() => {
              selectedErrors.forEach(id => onResolve(id))
              setSelectedErrors(new Set())
            }}
            className="btn bg-green-600 hover:bg-green-700 text-xs py-1 px-3"
          >
            Resolve All
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${selectedErrors.size} selected errors?`)) {
                selectedErrors.forEach(id => onDelete(id))
                setSelectedErrors(new Set())
              }
            }}
            className="btn bg-red-600 hover:bg-red-700 text-xs py-1 px-3"
          >
            Delete All
          </button>
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="border-b border-errtrace-dark-700">
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedErrors.size === errors.length && errors.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-errtrace-dark-600 bg-errtrace-dark-800 text-errtrace-primary focus:ring-errtrace-primary"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              Environment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-errtrace-dark-800">
          {errors.map((error) => (
            <tr 
              key={error.id}
              className={`hover:bg-errtrace-dark-800/50 transition-colors ${
                expandedRows.has(error.id) ? 'bg-errtrace-dark-800/30' : ''
              }`}
            >
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedErrors.has(error.id)}
                  onChange={() => toggleSelect(error.id)}
                  className="rounded border-errtrace-dark-600 bg-errtrace-dark-800 text-errtrace-primary focus:ring-errtrace-primary"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${getLevelStyle(error.level)}`}>
                  {getLevelIcon(error.level)}
                  <span>{error.level.toUpperCase()}</span>
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleRow(error.id)}
                    className="text-errtrace-dark-400 hover:text-white"
                  >
                    {expandedRows.has(error.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {error.message.length > 80 
                        ? `${error.message.substring(0, 80)}...` 
                        : error.message}
                    </div>
                    {error.url && (
                      <div className="flex items-center space-x-1 mt-1 text-xs text-errtrace-dark-400">
                        <Globe className="h-3 w-3" />
                        <span>{error.url}</span>
                      </div>
                    )}
                  </div>
                </div>
                {expandedRows.has(error.id) && error.stack_trace && (
                  <div className="pl-8 mt-3">
                    <pre className="text-xs bg-errtrace-dark-900 rounded-lg p-3 overflow-x-auto font-mono text-errtrace-dark-300">
                      {error.stack_trace}
                    </pre>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-errtrace-dark-300">
                  {error.environment}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1 text-sm text-errtrace-dark-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(error.created_at).toLocaleString()}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  error.resolved 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {error.resolved ? 'Resolved' : 'Unresolved'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onView(error.id)}
                    className="p-1.5 text-errtrace-dark-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {!error.resolved && (
                    <button
                      onClick={() => onResolve(error.id)}
                      className="p-1.5 text-errtrace-dark-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                      title="Mark as Resolved"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(error.id)}
                    className="p-1.5 text-errtrace-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}