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
import type { HttpClientSyncCustomerRepository } from "@fludge/sync/repositories/customer/client-sync-customer.repository";

export type SyncData = {
  error: Error | null;
  success: boolean;
  syncedAt: Date | null;
};

function httpClientCustomerRepository(
  orpc: OrpcQueryClient,
): HttpClientSyncCustomerRepository {
  return {
    findLastSyncedAt: async (lastSyncedAt) => {
      const data = await orpc.sync.customer.find.call(lastSyncedAt);

      return data;
    },
  };
}

export function useSyncCustomer() {
  const orpc = useOrpc();
  const { session } = useAuth();
  const { isInternetReachable } = useNetwork();
  const { customerContainer } = useContainer();

  const httpRepository = httpClientCustomerRepository(orpc);

  return useSuspenseQuery({
    queryKey: ["sync", "customer"],
    queryFn: async (): Promise<SyncData> => {
      if (!session.data || !isInternetReachable)
        return {
          error: null,
          success: false,
          syncedAt: null,
        };

      const [lastSyncedAt, errorGetLastSyncedAt] = await tryCatch(
        customerContainer.repositories.syncCustomerRepository.getLastSyncedAt(),
      );

      if (errorGetLastSyncedAt)
        return {
          error: errorGetLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      const [values, errorFindLastSyncedAt] = await tryCatch(
        httpRepository.findLastSyncedAt({
          customer: lastSyncedAt.customer?.updatedAt ?? null,
        }),
      );

      if (errorFindLastSyncedAt)
        return {
          error: errorFindLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      const [, erroSaveAll] = await tryCatch(
        customerContainer.repositories.syncCustomerRepository.saveAll(values),
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