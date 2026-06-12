'use client'

import { useState, useEffect } from 'react'
import { ErrTraceStats } from '@/lib/types'
import {
  AlertTriangle,
  AlertCircle,
  Activity,
  TrendingUp,
  Clock,
  Users,
  BarChart3
} from 'lucide-react'

interface EventStats {
  total: number
  today: number
  uniqueUsers: number
  topEvents: Array<{ name: string; count: number }>
  eventTimeline: Array<{ hour: string; count: number }>
}

export default function StatsBar() {
  const [errorStats, setErrorStats] = useState<ErrTraceStats | null>(null)
  const [eventStats, setEventStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const [errorRes, eventRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/events/stats')
      ])
      const errorData = await errorRes.json()
      const eventData = await eventRes.json()
      setErrorStats(errorData)
      setEventStats(eventData)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-errtrace-dark-700 rounded w-24 mb-3" />
            <div className="h-8 bg-errtrace-dark-700 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      label: 'Total Errors',
      value: errorStats?.total || 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-l-red-500',
    },
    {
      label: 'Unresolved',
      value: errorStats?.unresolved || 0,
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-l-orange-500',
    },
    {
      label: 'Total Events',
      value: eventStats?.total || 0,
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-l-blue-500',
    },
    {
      label: 'Unique Users',
      value: eventStats?.uniqueUsers || 0,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-l-green-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats cards – horizontal scroll on mobile */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:snap-none sm:px-0 sm:mx-0">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`card border-l-4 ${card.borderColor} hover:shadow-lg transition-all duration-300 group min-w-[80vw] sm:min-w-0 snap-center`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-errtrace-dark-400 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                    {card.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event timeline sparkline */}
      {eventStats?.eventTimeline && (
        <div className="card overflow-x-auto">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <span>Events (Last 24h)</span>
          </h3>
          <div className="flex items-end space-x-1 h-20 min-w-[500px] sm:min-w-0">
            {eventStats.eventTimeline.map((item) => {
              const maxCount = Math.max(...eventStats.eventTimeline.map(i => i.count), 1);
              const height = (item.count / maxCount) * 100;
              return (
                <div
                  key={item.hour}
                  className="flex-1 group relative"
                  style={{ height: '100%' }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-blue-500/30 hover:bg-blue-500/50 rounded-t transition-colors"
                    style={{ height: `${height}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-errtrace-dark-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity">
                      {item.hour.substring(11)}:00 - {item.count} events
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top events – scrollable on mobile */}
      {eventStats?.topEvents && eventStats.topEvents.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span>Top Events</span>
          </h3>
          <div className="space-y-2 overflow-x-auto">
            {eventStats.topEvents.map((event, index) => (
              <div key={event.name} className="flex items-center justify-between min-w-[300px] sm:min-w-0">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-errtrace-dark-500 w-4">{index + 1}</span>
                  <span className="text-sm text-white truncate">{event.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-errtrace-dark-800 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(event.count / eventStats.topEvents[0].count) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-errtrace-dark-400 w-8 text-right">{event.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}