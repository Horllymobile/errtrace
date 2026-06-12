'use client'

import { TrackErrTraceEvent } from '@/lib/types'
import { X, Activity, Clock, Tag, User, Globe } from 'lucide-react'

interface EventModalProps {
  event: TrackErrTraceEvent
  onClose: () => void
}

export default function EventModal({ event, onClose }: EventModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        
        <div 
          className="relative bg-errtrace-dark-900 rounded-xl border border-errtrace-dark-800 max-w-2xl w-full shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-errtrace-dark-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{event.name}</h2>
                <p className="text-xs text-errtrace-dark-400">{event.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-errtrace-dark-400 hover:text-white hover:bg-errtrace-dark-800 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-errtrace-dark-400 flex items-center space-x-1 mb-1">
                  <Clock className="h-3 w-3" />
                  <span>Timestamp</span>
                </label>
                <p className="text-sm text-white">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs text-errtrace-dark-400 flex items-center space-x-1 mb-1">
                  <Globe className="h-3 w-3" />
                  <span>Environment</span>
                </label>
                <p className="text-sm text-white">{event.environment}</p>
              </div>
              {event.user && (
                <div>
                  <label className="text-xs text-errtrace-dark-400 flex items-center space-x-1 mb-1">
                    <User className="h-3 w-3" />
                    <span>User</span>
                  </label>
                  <p className="text-sm text-white">{event.user.email || event.user.username || event.user.id}</p>
                </div>
              )}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div>
                <label className="text-xs text-errtrace-dark-400 flex items-center space-x-1 mb-2">
                  <Tag className="h-3 w-3" />
                  <span>Tags</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-errtrace-dark-800 text-errtrace-dark-300 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-errtrace-dark-400 mb-2 block">Properties</label>
              <pre className="text-sm bg-errtrace-dark-950 rounded-lg p-4 overflow-x-auto font-mono text-errtrace-dark-300">
                {JSON.stringify(event.properties, null, 2)}
              </pre>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-errtrace-dark-800 flex justify-end">
            <button
              onClick={onClose}
              className="btn bg-errtrace-dark-800 text-errtrace-dark-300 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}