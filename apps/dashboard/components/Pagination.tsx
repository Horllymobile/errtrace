'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
  onPageChange: (offset: number) => void
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1
  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const startItem = pagination.offset + 1
  const endItem = Math.min(pagination.offset + pagination.limit, pagination.total)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  if (pagination.total === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Items info */}
      <div className="text-sm text-errtrace-dark-400">
        Showing <span className="text-white font-medium">{startItem}</span> to{' '}
        <span className="text-white font-medium">{endItem}</span> of{' '}
        <span className="text-white font-medium">{pagination.total}</span> errors
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page */}
        <button
          onClick={() => onPageChange(0)}
          disabled={pagination.offset === 0}
          className="p-2 text-errtrace-dark-400 hover:text-white hover:bg-errtrace-dark-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(pagination.offset - pagination.limit)}
          disabled={pagination.offset === 0}
          className="p-2 text-errtrace-dark-400 hover:text-white hover:bg-errtrace-dark-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => {
                if (typeof page === 'number') {
                  onPageChange((page - 1) * pagination.limit)
                }
              }}
              disabled={typeof page === 'string'}
              className={`min-w-[2rem] h-8 flex items-center justify-center text-sm rounded-lg transition-all ${
                page === currentPage
                  ? 'bg-errtrace-primary text-white font-medium'
                  : typeof page === 'string'
                  ? 'text-errtrace-dark-500 cursor-default'
                  : 'text-errtrace-dark-400 hover:text-white hover:bg-errtrace-dark-800'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Mobile page indicator */}
        <span className="sm:hidden text-sm text-errtrace-dark-400 mx-2">
          {currentPage} / {totalPages}
        </span>

        {/* Next page */}
        <button
          onClick={() => onPageChange(pagination.offset + pagination.limit)}
          disabled={!pagination.has_more}
          className="p-2 text-errtrace-dark-400 hover:text-white hover:bg-errtrace-dark-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange((totalPages - 1) * pagination.limit)}
          disabled={!pagination.has_more}
          className="p-2 text-errtrace-dark-400 hover:text-white hover:bg-errtrace-dark-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      {/* Page size selector */}
      <div className="flex items-center space-x-2 text-sm text-errtrace-dark-400">
        <span>Show</span>
        <select
          value={pagination.limit}
          onChange={(e) => {
            const newLimit = parseInt(e.target.value)
            onPageChange(0) // Reset to first page
          }}
          className="bg-errtrace-dark-800 border border-errtrace-dark-700 rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-errtrace-primary"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span>per page</span>
      </div>
    </div>
  )
}