"use client";


import { cn } from "@/lib/utils";

// 👇 imported from shadcn registry
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  visiblePages: number[];
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  loading?: boolean;
  error?: string | null;
}

export function Pagination({
  currentPage,
  totalPages,
  visiblePages,
  onPageChange,
  onPrevious,
  onNext,
  loading = false,
  error = null,
}: PaginationProps) {
  if (totalPages <= 1 || loading || error) return null;

  return (
    <UIPagination className="mt-8 mb-6 flex justify-center">
      <PaginationContent>

        {/* PREVIOUS */}
        <PaginationItem>
          <PaginationPrevious
            onClick={onPrevious}
            className={cn(
              currentPage === 1 && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>

        {/* PAGE NUMBERS */}
        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={currentPage === page}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* ELLIPSIS */}
        {totalPages > visiblePages.length && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* NEXT */}
        <PaginationItem>
          <PaginationNext
            onClick={onNext}
            className={cn(
              currentPage === totalPages && "pointer-events-none opacity-50"
            )}
          />
        </PaginationItem>

      </PaginationContent>
    </UIPagination>
  );
}