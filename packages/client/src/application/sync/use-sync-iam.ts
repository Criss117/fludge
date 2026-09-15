import { useSuspenseQuery } from "@tanstack/react-query";

import { useAuth } from "@fludge/client/providers/auth.provider";
import { useNetwork } from "@fludge/client/providers/network-status.provider";
import {
  useOrpc,
  type OrpcQueryClient,
} from "@fludge/client/providers/orpc.provider";
import { tryCatch } from "@fludge/utils/trycatch";
import type { HttpClientIamRepository } from "@fludge/sync/repositories/iam/client-iam.repository";
import { useContainer } from "@fludge/client/providers/container.provider";
import { MINUTE } from "@fludge/utils/constants";

export type SyncData = {
  error: Error | null;
  success: boolean;
  syncedAt: Date | null;
};

function httpClientIamRepository(
  orpc: OrpcQueryClient,
): HttpClientIamRepository {
  return {
    findLastSyncedAt: async (lastSyncedAt) => {
      const data = await orpc.sync.iam.find.call(lastSyncedAt);

      return data;
    },
  };
}

export function useSyncIam() {
  const orpc = useOrpc();
  const { session } = useAuth();
  const { isInternetReachable } = useNetwork();
  const { iamContainer } = useContainer();

  const httpRepository = httpClientIamRepository(orpc);

  return useSuspenseQuery({
    queryKey: ["sync", "iam"],
    queryFn: async (): Promise<SyncData> => {
      if (!session.data || !isInternetReachable)
        return {
          error: null,
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
        httpRepository.findLastSyncedAt({
          user: lastSyncedAt.user?.updatedAt ?? null,
          group: lastSyncedAt.group?.updatedAt ?? null,
          member: lastSyncedAt.member?.createdAt ?? null,
          organization: lastSyncedAt.organization?.updatedAt ?? null,
          groupMember: lastSyncedAt.groupMember?.createdAt ?? null,
        }),
      );

      if (errorFindLastSyncedAt)
        return {
          error: errorFindLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      const [, erroSaveAll] = await tryCatch(
        iamContainer.repositories.syncIamRepository.saveAll(values),
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
