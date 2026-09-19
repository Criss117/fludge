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
import type { HttpClientSyncSaleRepository } from "@fludge/sync/repositories/sale/client-sync-sale.repository";

export type SyncData = {
  error: Error | null;
  success: boolean;
  syncedAt: Date | null;
};

function httpClientSaleRepository(
  orpc: OrpcQueryClient,
): HttpClientSyncSaleRepository {
  return {
    findLastSyncedAt: async (lastSyncedAt) => {
      const data = await orpc.sync.sale.find.call(lastSyncedAt);

      return data;
    },
  };
}

export function useSyncSale() {
  const orpc = useOrpc();
  const { session } = useAuth();
  const { isInternetReachable } = useNetwork();
  const { salesContainer } = useContainer();

  const httpRepository = httpClientSaleRepository(orpc);

  return useSuspenseQuery({
    queryKey: ["sync", "sale"],
    queryFn: async (): Promise<SyncData> => {
      if (!session.data || !isInternetReachable)
        return {
          error: null,
          success: false,
          syncedAt: null,
        };

      const [lastSyncedAt, errorGetLastSyncedAt] = await tryCatch(
        salesContainer.repositories.syncSaleRepository.getLastSyncedAt(),
      );

      if (errorGetLastSyncedAt)
        return {
          error: errorGetLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      const [values, errorFindLastSyncedAt] = await tryCatch(
        httpRepository.findLastSyncedAt({
          sale: lastSyncedAt.sale?.updatedAt ?? null,
          saleItem: lastSyncedAt.saleItem?.updatedAt ?? null,
        }),
      );

      if (errorFindLastSyncedAt)
        return {
          error: errorFindLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      const [, erroSaveAll] = await tryCatch(
        salesContainer.repositories.syncSaleRepository.saveAll(values),
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
