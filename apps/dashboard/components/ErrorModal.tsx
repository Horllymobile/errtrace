'use client'

import { Fragment } from 'react'
import { ErrorLog } from '@/lib/types'
import { 
  X, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Bug,
  Globe,
  Clock,
  Monitor,
  User,
  Tag,
  Copy,
  Check
} from 'lucide-react'
import { useState } from 'react'

interface ErrorModalProps {
  error: ErrorLog
  onClose: () => void
}

export default function ErrorModal({ error, onClose }: ErrorModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'stack' | 'metadata'>('details')
  const [copied, setCopied] = useState(false)

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'warning': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'info': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'debug': return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      default: return ''
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'stack', label: 'Stack Trace' },
    { id: 'metadata', label: 'Metadata' },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

        {/* Modal */}
        <div 
          className="relative bg-errtrace-dark-900 rounded-xl border border-errtrace-dark-800 max-w-3xl w-full shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-errtrace-dark-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getLevelStyle(error.level)}`}>
                {error.level === 'error' && <AlertCircle className="h-5 w-5" />}
                {error.level === 'warning' && <AlertTriangle className="h-5 w-5" />}
                {error.level === 'info' && <Info className="h-5 w-5" />}
                {error.level === 'debug' && <Bug className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Error Details</h2>
                <p className="text-xs text-errtrace-dark-400">{error.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-errtrace-dark-400 hover:text-white hover:bg-errtrace-dark-800 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error message */}
          <div className="px-6 py-4 bg-errtrace-dark-800/50">
            <div className="flex items-start justify-between">
              <p className="text-white font-medium text-lg">{error.message}</p>
              <button
                onClick={() => copyToClipboard(error.message)}
                className="p-1.5 text-errtrace-dark-400 hover:text-white hover:bg-errtrace-dark-700 rounded-lg transition-all ml-2 flex-shrink-0"
                title="Copy message"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-errtrace-dark-800">
            <nav className="flex space-x-4 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-errtrace-primary text-errtrace-primary'
                      : 'border-transparent text-errtrace-dark-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem icon={<Clock className="h-4 w-4" />} label="Timestamp">
                    {new Date(error.created_at).toLocaleString()}
                  </DetailItem>
                  <DetailItem icon={<Globe className="h-4 w-4" />} label="Environment">
                    {error.environment}
                  </DetailItem>
                  {error.url && (
                    <DetailItem icon={<Globe className="h-4 w-4" />} label="URL">
                      {error.url}
                    </DetailItem>
                  )}
                  {error.user_agent && (
                    <DetailItem icon={<Monitor className="h-4 w-4" />} label="User Agent">
                      <span className="text-xs">{error.user_agent}</span>
                    </DetailItem>
                  )}
                  {error.ip_address && (
                    <DetailItem icon={<User className="h-4 w-4" />} label="IP Address">
                      {error.ip_address}
                    </DetailItem>
                  )}
                  <DetailItem label="Status">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      error.resolved 
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {error.resolved ? 'Resolved' : 'Unresolved'}
                    </span>
                  </DetailItem>
                </div>

                {error.tags && error.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-errtrace-dark-400 uppercase mb-2 flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>Tags</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {error.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-errtrace-dark-800 text-errtrace-dark-300 text-xs rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stack' && (
              <div>
                {error.stack_trace ? (
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(error.stack_trace)}
                      className="absolute top-2 right-2 p-1.5 text-errtrace-dark-400 hover:text-white hover:bg-errtrace-dark-700 rounded-lg transition-all"
                      title="Copy stack trace"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <pre className="text-sm bg-errtrace-dark-950 rounded-lg p-4 overflow-x-auto font-mono text-errtrace-dark-300 leading-relaxed">
                      {error.stack_trace}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-errtrace-dark-400">
                    No stack trace available
                  </div>
                )}
              </div>
            )}

            {activeTab === 'metadata' && (
              <div>
                {error.metadata && error.metadata !== '{}' ? (
                  <pre className="text-sm bg-errtrace-dark-950 rounded-lg p-4 overflow-x-auto font-mono text-errtrace-dark-300">
                    {JSON.stringify(
                      typeof error.metadata === 'string' 
                        ? JSON.parse(error.metadata) 
                        : error.metadata, 
                      null, 
                      2
                    )}
                  </pre>
                ) : (
                  <div className="text-center py-8 text-errtrace-dark-400">
                    No metadata available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-errtrace-dark-800 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn bg-errtrace-dark-800 text-errtrace-dark-300 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={() => copyToClipboard(JSON.stringify(error, null, 2))}
              className="btn bg-errtrace-primary text-white"
            >
              Copy JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center space-x-1 text-xs text-errtrace-dark-400 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-sm text-white break-all">{children}</div>
    </div>
  )
}