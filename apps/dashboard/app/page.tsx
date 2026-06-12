'use client'

import { useState, useEffect, useCallback } from 'react'
import { ErrorLog, TrackErrTraceEvent } from '@/lib/types'
import StatsBar from '@/components/StatsBar'
import Filters from '@/components/Filters'
import ErrorTable from '@/components/ErrorTable'
import ErrorModal from '@/components/ErrorModal'
import Pagination from '@/components/Pagination'
import toast from 'react-hot-toast'
import { Activity, AlertTriangle, Bug, RefreshCw } from 'lucide-react';
import { ErrTrace } from 'errtrace';
import EventModal from '@/components/EventModal'
import EventTable from '@/components/EventTable'

const errtrace = new ErrTrace({
  dsn: typeof window !== 'undefined' ? window.location.origin : '',
  environment: 'dashboard',
  tags: ['manual-test'],
});

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'errors' | 'events'>('errors')
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [events, setEvents] = useState<TrackErrTraceEvent[]>([])
  const [pagination, setPagination] = useState({
    total: 0, limit: 20, offset: 0, has_more: false
  })
  const [filters, setFilters] = useState({
    search: '', level: '', resolved: ''
  })
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<TrackErrTraceEvent | null>(null)
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
      toast.error('Failed to fetch errors')
    } finally {
      setLoading(false)
    }
  }, [pagination.offset, pagination.limit, filters])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/events?limit=50`)
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'errors') {
      fetchErrors()
    } else {
      fetchEvents()
    }
  }, [activeTab, fetchErrors, fetchEvents])

  const handleTestError = async () => {
    const errorId = await errtrace.captureError(
      new Error('Test error from dashboard'),
      { metadata: { source: 'dashboard-test' } }
    );
    if (errorId) {
      toast.success(`Test error sent!`);
      fetchErrors()
    }
  };

  const handleTestEvent = async () => {
    await errtrace.track('dashboard_test', {
      source: 'dashboard',
      test: true,
      timestamp: new Date().toISOString(),
    });
    toast.success('Test event sent!');
    fetchEvents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            <span className="text-errtrace-primary">Err</span>
            <span className="text-white">Trace</span>
          </h1>
          <p className="text-errtrace-dark-400 mt-2">Error & Event Tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleTestEvent} className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Test Event</span>
          </button>
          <button onClick={handleTestError} className="btn bg-errtrace-warning hover:bg-yellow-600 text-white flex items-center space-x-2">
            <Bug className="h-4 w-4" />
            <span>Test Error</span>
          </button>
          <button onClick={() => { activeTab === 'errors' ? fetchErrors() : fetchEvents(); toast.success('Refreshed'); }} className="btn bg-errtrace-primary hover:bg-errtrace-secondary text-white flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <StatsBar />

      {/* Tabs */}
      <div className="flex space-x-4 mt-8 border-b border-errtrace-dark-800">
        <button
          onClick={() => setActiveTab('errors')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'errors'
            ? 'border-red-500 text-red-400'
            : 'border-transparent text-errtrace-dark-400 hover:text-white'
            }`}
        >
          <span className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Errors</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'events'
            ? 'border-blue-500 text-blue-400'
            : 'border-transparent text-errtrace-dark-400 hover:text-white'
            }`}
        >
          <span className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Events</span>
          </span>
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'errors' ? (
          <>
            <Filters filters={filters} onSearch={(s) => setFilters(p => ({ ...p, search: s }))} onFilterChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))} />
            <div className="mt-4 card">
              <ErrorTable errors={errors} loading={loading} onView={setSelectedError} onResolve={async (id) => { await fetch(`/api/errors/${id}`, { method: 'PATCH', body: JSON.stringify({ resolved: 1 }) }); fetchErrors(); }} onDelete={async (id) => { await fetch(`/api/errors/${id}`, { method: 'DELETE' }); fetchErrors(); }} />
            </div>
            <Pagination pagination={pagination} onPageChange={(offset) => setPagination(p => ({ ...p, offset }))} />
          </>
        ) : (
          <div className="card">
            <EventTable events={events} loading={loading} onView={setSelectedEvent} onDelete={async (id) => { await fetch(`/api/events/${id}`, { method: 'DELETE' }); fetchEvents(); }} />
          </div>
        )}
      </div>

      {selectedError && <ErrorModal error={selectedError} onClose={() => setSelectedError(null)} />}
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  )
}