'use client'

import { TrackErrTraceEvent } from '@/lib/types'
import { 
  Activity,
  Clock,
  Tag,
  User,
  Eye,
  Trash2,
  MousePointer,
  Navigation,
  ShoppingCart,
  UserPlus,
  Heart,
  Star,
  MessageSquare,
  Share2,
  Zap
} from 'lucide-react'

interface EventTableProps {
  events: TrackErrTraceEvent[]
  loading: boolean
  onView: (event: TrackErrTraceEvent) => void
  onDelete: (id: string) => void
}

const eventIcons: Record<string, any> = {
  '$pageview': Navigation,
  'click': MousePointer,
  'purchase': ShoppingCart,
  'signup': UserPlus,
  'like': Heart,
  'favorite': Star,
  'comment': MessageSquare,
  'share': Share2,
}

export default function EventTable({ events, loading, onView, onDelete }: EventTableProps) {
  const getEventIcon = (name: string) => {
    const iconName = name.replace('$', '')
    if (eventIcons[iconName]) {
      const Icon = eventIcons[iconName]
      return <Icon className="h-4 w-4" />
    }
    if (name === '$pageview') return <Navigation className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getEventColor = (name: string) => {
    if (name === '$pageview') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    if (name.includes('purchase')) return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (name.includes('signup')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    if (name.includes('error')) return 'bg-red-500/10 text-red-400 border-red-500/20'
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
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

  if (events.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-errtrace-dark-800 mb-4">
          <Activity className="h-8 w-8 text-errtrace-dark-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No events found</h3>
        <p className="text-errtrace-dark-400">
          Start tracking events to see them here
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-errtrace-dark-700">
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              Event
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              Properties
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-errtrace-dark-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-errtrace-dark-800">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-errtrace-dark-800/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium border ${getEventColor(event.name)}`}>
                  {getEventIcon(event.name)}
                  <span>{event.name.replace('$', '')}</span>
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {Object.entries(event.properties || {}).slice(0, 3).map(([key, value]) => (
                    <span key={key} className="px-2 py-0.5 bg-errtrace-dark-800 rounded text-xs text-errtrace-dark-300">
                      {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  ))}
                  {Object.keys(event.properties || {}).length > 3 && (
                    <span className="text-xs text-errtrace-dark-400">
                      +{Object.keys(event.properties).length - 3} more
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {event.user ? (
                  <div className="flex items-center space-x-1 text-sm text-errtrace-dark-300">
                    <User className="h-3.5 w-3.5" />
                    <span>{event.user.email || event.user.username || event.user.id}</span>
                  </div>
                ) : (
                  <span className="text-sm text-errtrace-dark-500">Anonymous</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1 text-sm text-errtrace-dark-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onView(event)}
                    className="p-1.5 text-errtrace-dark-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(event.id)}
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