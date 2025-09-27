export interface PaginationResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
