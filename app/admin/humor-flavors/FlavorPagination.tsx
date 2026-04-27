"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface FlavorPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function FlavorPagination({ currentPage, totalPages }: FlavorPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState(String(currentPage));

  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  function navigateTo(page: number) {
    const clamped = Math.max(1, Math.min(totalPages, page));
    const params = new URLSearchParams(searchParams.toString());
    if (clamped === 1) {
      params.delete("page");
    } else {
      params.set("page", String(clamped));
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const parsed = parseInt(inputValue, 10);
      if (!isNaN(parsed)) navigateTo(parsed);
    }
  }

  function handleInputBlur() {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      navigateTo(parsed);
    } else {
      setInputValue(String(currentPage));
    }
  }

  if (totalPages <= 1) return null;

  const btnBase =
    "inline-flex items-center justify-center h-8 min-w-[2rem] px-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";
  const btnInactive =
    "border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--card-border)]";
  const btnDisabled =
    "border border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] opacity-40 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {/* Prev arrow */}
      <button
        onClick={() => navigateTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className={currentPage <= 1 ? `${btnBase} ${btnDisabled}` : `${btnBase} ${btnInactive}`}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page input */}
      <div className="flex items-center gap-1.5 text-sm text-[var(--muted)]">
        <span className="hidden sm:inline">Page</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className="w-14 h-8 px-2 text-center text-sm rounded-md border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Go to page"
        />
        <span className="hidden sm:inline">of {totalPages}</span>
      </div>

      {/* Next arrow */}
      <button
        onClick={() => navigateTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={currentPage >= totalPages ? `${btnBase} ${btnDisabled}` : `${btnBase} ${btnInactive}`}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
