export type SyncCursor = {
  updatedAt: Date;
  id: string;
};

export type SyncPage<T> = {
  items: T[];
  nextCursor: SyncCursor | null;
  hasMore: boolean;
};

export type PaginateSyncQueryFn<T> = (cursor: SyncCursor | null, limit: number) => Promise<T[]>;

export async function paginateSync<T extends { updatedAt: Date; id: string }>(
  query: PaginateSyncQueryFn<T>,
  cursor: SyncCursor | null,
  limit: number,
): Promise<SyncPage<T>> {
  const rows = await query(cursor, limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  const lastItem = items[items.length - 1];

  return {
    items,
    hasMore,
    nextCursor: lastItem ? { updatedAt: lastItem.updatedAt, id: lastItem.id } : cursor,
  };
}
