export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const parsePagination = (query: Record<string, unknown>): PaginationParams => ({
  page: Math.max(1, Number(query.page) || 1),
  limit: Math.min(100, Math.max(1, Number(query.limit) || 20)),
  sortBy: query.sortBy as string | undefined,
  sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
});
