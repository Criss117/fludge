/**
 * Cursor is a way to keep track of the current page.
 * page initialization is 0.
 */
export type Cursor = {
  page: number;
  limit: number;
};

export const DEFAULT_PAGE_SIZE = 20;

export const DEFAULT_CURSOR: Cursor = {
  page: 0,
  limit: DEFAULT_PAGE_SIZE,
};

export type PaginatedResponse<T> = {
  items: T[];
  currentCursor: Cursor;
  nextCursor: Cursor | null;
};

export function paginate<T>(
  items: T[],
  currentCursor: Cursor,
): PaginatedResponse<T> {
  const nextCursor =
    items.length > currentCursor.limit
      ? { page: currentCursor.page + 1, limit: currentCursor.limit }
      : null;

  return {
    items: items.slice(0, currentCursor.limit),
    currentCursor,
    nextCursor,
  };
}
