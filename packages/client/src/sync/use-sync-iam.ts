import { useContainer } from "@fludge/client/providers/container.provider";
import { useNetwork } from "@fludge/client/providers/network-status.provider";
import { type OrpcQueryClient, useOrpc } from "@fludge/client/providers/orpc.provider";
import type { HttpClientSyncIamRepository } from "@fludge/sync/repositories/iam/client-sync-iam.repository";
import { MINUTE } from "@fludge/utils/constants";
import { RepositoryError } from "@fludge/utils/errors/repository.error";
import { tryCatch } from "@fludge/utils/trycatch";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAppState } from "../iam/hooks/use-app-state";

export type SyncData = {
  error: Error | null;
  success: boolean;
  syncedAt: Date | null;
};

function httpClientIamRepository(orpc: OrpcQueryClient): HttpClientSyncIamRepository {
  return {
    findLastSyncedAt: async (lastSyncedAt) => {
      return tryCatch(orpc.sync.syncIam.call(lastSyncedAt), {
        parseError: (raw) =>
          new RepositoryError("api_errors.iam.organizations.isr_on_find", {
            cause: raw instanceof Error ? raw : new Error(String(raw)),
          }),
      });
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

        const [lastSyncedAt, errorGetLastSyncedAt] =
          await iamContainer.repositories.syncIamRepository.getLastSyncedAt();

        if (errorGetLastSyncedAt)
          return {
            error: errorGetLastSyncedAt,
            success: false,
            syncedAt: null,
          };

        const [values, errorFindLastSyncedAt] = await httpRepository.findLastSyncedAt(lastSyncedAt);

        if (errorFindLastSyncedAt)
          return {
            error: errorFindLastSyncedAt,
            success: false,
            syncedAt: null,
          };

        hasMore = Object.values(values).some((page) => page.hasMore);

        const [, erroSaveAll] = await iamContainer.repositories.syncIamRepository.saveAll(values);

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
