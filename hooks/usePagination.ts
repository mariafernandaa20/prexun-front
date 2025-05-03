import { useState } from 'react';

interface PaginationState {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

interface UsePaginationProps {
  initialPerPage?: number;
}

export const usePagination = ({ initialPerPage = 50 }: UsePaginationProps = {}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: initialPerPage,
  });

  return {
    pagination,
    setPagination,
  };
};