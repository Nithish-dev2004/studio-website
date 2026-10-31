"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  currentCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  recordLabel?: string;
  className?: string;
}

export default function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  currentCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
  recordLabel = "records",
  className = "",
}: TablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);

  return (
    <div
      className={`flex flex-col gap-3.5 border-t border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${className}`}
    >
      {/* Left: Showing X of Y records */}
      <div className="text-xs text-muted-foreground sm:text-sm">
        Showing <strong className="font-semibold text-foreground">{currentCount}</strong> of{" "}
        <strong className="font-semibold text-foreground">{totalRecords}</strong> {recordLabel}
      </div>

      {/* Right: Per page dropdown + Previous + Page X of Y + Next */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs sm:gap-3 sm:text-sm">
        {/* Per page selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="per-page-select" className="text-muted-foreground whitespace-nowrap text-xs sm:text-sm">
            Per page
          </label>
          <select
            id="per-page-select"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
            }}
            aria-label="Records per page"
            className="cursor-pointer min-h-[44px] sm:min-h-[34px] rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:border-accent focus:border-accent focus:outline-hidden"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex min-h-[44px] sm:min-h-[34px] items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:border-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>

        {/* Page X of Y */}
        <span className="text-xs text-muted-foreground whitespace-nowrap sm:text-sm">
          Page <strong className="font-semibold text-foreground">{currentPage}</strong> of{" "}
          <strong className="font-semibold text-foreground">{safeTotalPages}</strong>
        </span>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          className="inline-flex min-h-[44px] sm:min-h-[34px] items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:border-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
