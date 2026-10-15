import { useSuspenseQuery } from "@tanstack/react-query";

import { useNetwork } from "@fludge/client/providers/network-status.provider";
import {
  useOrpc,
  type OrpcQueryClient,
} from "@fludge/client/providers/orpc.provider";
import { tryCatch } from "@fludge/utils/trycatch";
import { useContainer } from "@fludge/client/providers/container.provider";
import { MINUTE } from "@fludge/utils/constants";
import type { HttpClientSyncIamRepository } from "@fludge/sync/repositories/iam/client-sync-iam.repository";
import { useEffect } from "react";
import { useAppState } from "../iam/hooks/use-app-state";

export type SyncData = {
  error: Error | null;
  success: boolean;
  syncedAt: Date | null;
};

function httpClientIamRepository(
  orpc: OrpcQueryClient,
): HttpClientSyncIamRepository {
  return {
    findLastSyncedAt: async (lastSyncedAt) => {
      const data = await orpc.sync.syncIam.call(lastSyncedAt);

      return data;
    },
  };
}

export function useSyncIam() {
  const orpc = useOrpc();
  const {
    data: { session },
  } = useAppState();
  const { isInternetReachable } = useNetwork();
  const { iamContainer } = useContainer();

  const httpRepository = httpClientIamRepository(orpc);

  const query = useSuspenseQuery({
    queryKey: ["sync", "iam", session?.user.id],
    queryFn: async (): Promise<SyncData> => {
      if (!session || !isInternetReachable)
        return {
          error: null,
          success: false,
          syncedAt: null,
        };

      let hasMore = false;
      let pages = 0;
      do {
        if (++pages > 1000)
          return {
            error: new Error("Sync did not converge"),
            success: false,
            syncedAt: null,
          };

        const [lastSyncedAt, errorGetLastSyncedAt] = await tryCatch(
          iamContainer.repositories.syncIamRepository.getLastSyncedAt(),
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

        hasMore = Object.values(values).some((page) => page.hasMore);

        const [, erroSaveAll] = await tryCatch(
          iamContainer.repositories.syncIamRepository.saveAll(values),
        );

        if (erroSaveAll)
          return {
            error: erroSaveAll,
            success: false,
            syncedAt: null,
          };
      } while (hasMore);

      return {
        error: null,
        syncedAt: new Date(),
        success: true,
      };
    },
    refetchInterval: MINUTE * 5,
  });

  useEffect(() => {
    if (isInternetReachable) query.refetch();
  }, [isInternetReachable]);

  return query;
}
