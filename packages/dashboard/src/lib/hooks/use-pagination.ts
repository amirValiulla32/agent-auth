/**
 * usePagination Hook
 * Manages pagination state and provides navigation helpers
 */

import { useState, useMemo } from 'react';

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  offset: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setItemsPerPage: (count: number) => void;
}

export type UsePaginationReturn = PaginationState & PaginationActions;

/**
 * Hook for managing pagination state
 *
 * @param totalItems - Total number of items to paginate
 * @param initialItemsPerPage - Items per page (default: 20)
 * @returns Pagination state and navigation functions
 *
 * @example
 * const pagination = usePagination(150, 20);
 *
 * // Use in component
 * <DataTable
 *   data={items.slice(pagination.offset, pagination.offset + pagination.itemsPerPage)}
 *   pagination={pagination}
 * />
 */
export function usePagination(
  totalItems: number,
  initialItemsPerPage: number = 20
): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calculate derived values
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage) || 1;
  }, [totalItems, itemsPerPage]);

  const offset = useMemo(() => {
    return (currentPage - 1) * itemsPerPage;
  }, [currentPage, itemsPerPage]);

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const hasPrevPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  // Navigation functions
  const goToPage = (page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clampedPage);
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const firstPage = () => {
    setCurrentPage(1);
  };

  const lastPage = () => {
    setCurrentPage(totalPages);
  };

  const handleSetItemsPerPage = (count: number) => {
    setItemsPerPage(count);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return {
    // State
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    offset,
    hasNextPage,
    hasPrevPage,
    // Actions
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setItemsPerPage: handleSetItemsPerPage,
  };
}
