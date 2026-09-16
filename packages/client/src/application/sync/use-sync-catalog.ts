import { useSuspenseQuery } from "@tanstack/react-query";

import { useAuth } from "@fludge/client/providers/auth.provider";
import { useNetwork } from "@fludge/client/providers/network-status.provider";
import {
  useOrpc,
  type OrpcQueryClient,
} from "@fludge/client/providers/orpc.provider";
import { tryCatch } from "@fludge/utils/trycatch";
import { useContainer } from "@fludge/client/providers/container.provider";
import { MINUTE } from "@fludge/utils/constants";
import type { HttpClientSyncCatalogRepository } from "@fludge/sync/repositories/catalog/client-sync-catalog.repository";

export type SyncData = {
  error: Error | null;
  success: boolean;
  syncedAt: Date | null;
};

function httpClientCatalogRepository(
  orpc: OrpcQueryClient,
): HttpClientSyncCatalogRepository {
  return {
    findLastSyncedAt: async (lastSyncedAt) => {
      const data = await orpc.sync.catalog.find.call(lastSyncedAt);

      return data;
    },
  };
}

export function useSyncCatalog() {
  const orpc = useOrpc();
  const { session } = useAuth();
  const { isInternetReachable } = useNetwork();
  const { catalogContainer } = useContainer();

  const httpRepository = httpClientCatalogRepository(orpc);

  return useSuspenseQuery({
    queryKey: ["sync", "catalog"],
    queryFn: async (): Promise<SyncData> => {
      if (!session.data || !isInternetReachable)
        return {
          error: null,
          success: false,
          syncedAt: null,
        };

      const [lastSyncedAt, errorGetLastSyncedAt] = await tryCatch(
        catalogContainer.repositories.syncCatalogRepository.getLastSyncedAt(),
      );

      if (errorGetLastSyncedAt)
        return {
          error: errorGetLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      const [values, errorFindLastSyncedAt] = await tryCatch(
        httpRepository.findLastSyncedAt({
          category: lastSyncedAt.category?.updatedAt ?? null,
          product: lastSyncedAt.product?.updatedAt ?? null,
        }),
      );

      if (errorFindLastSyncedAt)
        return {
          error: errorFindLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      const [, erroSaveAll] = await tryCatch(
        catalogContainer.repositories.syncCatalogRepository.saveAll(values),
      );

      if (erroSaveAll)
        return {
          error: erroSaveAll,
          success: false,
          syncedAt: null,
        };

      return {
        error: null,
        syncedAt: new Date(),
        success: true,
      };
    },
    refetchInterval: MINUTE * 5,
  });
}
