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
import type { HttpClientSyncCommerceRepository } from "@fludge/sync/repositories/commerse/client-sync-commerce.repository";

export type SyncData = {
  error: Error | null;
  success: boolean;
  syncedAt: Date | null;
};

function httpClientCommerceRepository(
  orpc: OrpcQueryClient,
): HttpClientSyncCommerceRepository {
  return {
    findLastSyncedAt: async (lastSyncedAt) => {
      const data = await orpc.sync.syncCommerce.call(lastSyncedAt);

      return data;
    },
  };
}

export function useSyncCommerce() {
  const orpc = useOrpc();
  const { session } = useAuth();
  const { isInternetReachable } = useNetwork();
  const { commerceContainer } = useContainer();

  const httpRepository = httpClientCommerceRepository(orpc);

  return useSuspenseQuery({
    queryKey: ["sync", "commerce"],
    queryFn: async (): Promise<SyncData> => {
      if (!session.data || !isInternetReachable)
        return {
          error: null,
          success: false,
          syncedAt: null,
        };

      const [lastSyncedAt, errorGetLastSyncedAt] = await tryCatch(
        commerceContainer.repositories.syncCommerceRepository.getLastSyncedAt(),
      );

      if (errorGetLastSyncedAt)
        return {
          error: errorGetLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      const [values, errorFindLastSyncedAt] = await tryCatch(
        httpRepository.findLastSyncedAt(lastSyncedAt),
      );

      if (errorFindLastSyncedAt)
        return {
          error: errorFindLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      const [, erroSaveAll] = await tryCatch(
        commerceContainer.repositories.syncCommerceRepository.saveAll(values),
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
