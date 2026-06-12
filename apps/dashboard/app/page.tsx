'use client'

import { useState, useEffect, useCallback } from 'react'
import { ErrorLog } from '@/lib/types'
import StatsBar from '@/components/StatsBar'
import Filters from '@/components/Filters'
import ErrorTable from '@/components/ErrorTable'
import ErrorModal from '@/components/ErrorModal'
import Pagination from '@/components/Pagination'
import toast from 'react-hot-toast'
import { RefreshCw } from 'lucide-react';
import { ErrTrace } from 'errtrace';

export default function Dashboard() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    has_more: false
  })
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    resolved: ''
  })
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchErrors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        ...(filters.level && { level: filters.level }),
        ...(filters.resolved && { resolved: filters.resolved }),
        ...(filters.search && { search: filters.search })
      })

      const response = await fetch(`/api/errors?${params}`)
      const data = await response.json()
      setErrors(data.errors)
      setPagination(prev => ({ ...prev, ...data.pagination }))
    } catch (error) {
      console.error('Error fetching errors:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.offset, pagination.limit, filters])

  useEffect(() => {
    fetchErrors()
  }, [fetchErrors])

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
    setPagination(prev => ({ ...prev, offset: 0 }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, offset: 0 }))
  }

  const handleViewError = async (id: string) => {
    try {
      const response = await fetch(`/api/errors/${id}`)
      const error = await response.json()
      setSelectedError(error)
    } catch (error) {
      console.error('Error fetching error details:', error)
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await fetch(`/api/errors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: 1 })
      })
      fetchErrors()
    } catch (error) {
      console.error('Error resolving error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this error?')) return

    try {
      await fetch(`/api/errors/${id}`, { method: 'DELETE' })
      fetchErrors()
    } catch (error) {
      console.error('Error deleting error:', error)
    }
  }

  const errtrace = typeof window !== 'undefined'
    ? new ErrTrace({
      dsn: window.location.origin,   // Dashboard's own API
      environment: 'dashboard',
      tags: ['manual-test'],
    })
    : null;

  // const handleTestError = async () => {
  //   if (!errtrace) return;
  //   try {
  //     const errorId = await errtrace.captureError(
  //       new Error('Test error from dashboard'),
  //       {
  //         metadata: { source: 'dashboard-test' },
  //       }
  //     );
  //     if (errorId) {
  //       toast.success(`Test error sent! ID: ${errorId}`);
  //       fetchErrors();
  //     } else {
  //       toast.error('Failed to send test error');
  //     }
  //   } catch (err) {
  //     toast.error('Network error');
  //     console.error(err);
  //   }
  // };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            <span className="text-errtrace-primary">Err</span>
            <span className="text-white">Trace</span>
          </h1>
          <p className="text-errtrace-dark-400 mt-2">Error tracking dashboard</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* <button
            onClick={handleTestError}
            className="btn bg-errtrace-warning hover:bg-yellow-600 text-white flex items-center space-x-2"
          >
            <Bug className="h-4 w-4" />
            <span>Test Error</span>
          </button> */}
          <button
            onClick={() => {
              fetchErrors();
              toast.success('Refreshed');
            }}
            className="btn bg-errtrace-primary hover:bg-errtrace-secondary text-white flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <StatsBar />

      <div className="mt-8">
        <Filters
          filters={filters}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className="mt-6 card overflow-hidden">
        <ErrorTable
          errors={errors}
          loading={loading}
          onView={handleViewError}
          onResolve={handleResolve}
          onDelete={handleDelete}
        />
      </div>

      <Pagination
        pagination={pagination}
        onPageChange={(offset) => setPagination(prev => ({ ...prev, offset }))}
      />

      {selectedError && (
        <ErrorModal
          error={selectedError}
          onClose={() => setSelectedError(null)}
        />
      )}
    </div>
  )
}