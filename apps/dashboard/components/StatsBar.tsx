'use client'

import { useState, useEffect } from 'react'
import { ErrTraceStats } from '@/lib/types'
import { AlertTriangle, AlertCircle, Info, Activity, TrendingUp, Clock } from 'lucide-react'

export default function StatsBar() {
  const [stats, setStats] = useState<ErrTraceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
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

  if (!stats) return null

  const cards = [
    {
      label: 'Total Errors',
      value: stats.total,
      icon: AlertTriangle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-l-blue-500',
      subtitle: 'All time'
    },
    {
      label: 'Unresolved',
      value: stats.unresolved,
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-l-red-500',
      subtitle: `${stats.total > 0 ? Math.round((stats.unresolved / stats.total) * 100) : 0}% of total`
    },
    {
      label: 'Today',
      value: stats.today,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-l-yellow-500',
      subtitle: new Date().toLocaleDateString()
    },
    {
      label: 'Error Rate',
      value: stats.total > 0 ? `${Math.round((stats.unresolved / stats.total) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-l-green-500',
      subtitle: 'Unresolved rate'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`card border-l-4 ${card.borderColor} hover:shadow-lg hover:shadow-${card.borderColor.replace('border-l-', '')}/10 transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-errtrace-dark-400 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                  {card.value}
                </p>
                <p className="text-xs text-errtrace-dark-500 mt-1">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>

            {/* Mini bar chart */}
            <div className="mt-3 flex items-end space-x-1 h-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-errtrace-dark-700"
                  style={{
                    height: `${Math.random() * 100}%`,
                    opacity: 0.5 + Math.random() * 0.5
                  }}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}