'use client'

import { Calendar, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export type DateRange = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'all'

interface DateFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const ranges: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
]

export default function DateFilter({ value, onChange }: DateFilterProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = ranges.find(r => r.value === value)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="btn bg-errtrace-dark-800 text-errtrace-dark-300 hover:text-white flex items-center space-x-2 border border-errtrace-dark-700"
      >
        <Calendar className="h-4 w-4" />
        <span>{selected?.label || 'Select range'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 bg-errtrace-dark-800 border border-errtrace-dark-700 rounded-lg shadow-xl z-50 w-44 py-1">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => {
                onChange(range.value)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                value === range.value
                  ? 'bg-errtrace-primary/20 text-white'
                  : 'text-errtrace-dark-300 hover:text-white hover:bg-errtrace-dark-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}