"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (totalPages <= 1) return null

  const from = (currentPage - 1) * itemsPerPage + 1
  const to = Math.min(currentPage * itemsPerPage, totalItems)

  // Build visible page numbers (max 5 pills)
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | "...")[] = [1]
    if (currentPage > 3) pages.push("...")
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push("...")
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      {/* Range label */}
      <p className="text-[11px] text-zinc-500 font-medium">
        Showing{" "}
        <span className="text-zinc-300 font-semibold">
          {from}–{to}
        </span>{" "}
        of <span className="text-zinc-300 font-semibold">{totalItems}</span> projects
      </p>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-900 bg-zinc-950/20 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>

        {/* Page pills */}
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-zinc-600 text-xs select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 ${
                currentPage === page
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30"
                  : "border border-zinc-900 bg-zinc-950/20 text-zinc-400 hover:text-white hover:bg-zinc-900/40"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-900 bg-zinc-950/20 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
