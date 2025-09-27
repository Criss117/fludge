import { HttpStatus } from "./http-status";

export interface CommonResponse<T> {
  data: T;
  statusCode: HttpStatus;
  message: string;
  error?: string;
}

export interface PaginationResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
