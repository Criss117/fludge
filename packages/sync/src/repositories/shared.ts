export interface BaseLocalRepository<T> {
  getLastSyncedAt: () => Promise<T | null>;
}
