import { useAuth } from "@fludge/client/providers/auth.provider";
import { useContainer } from "@fludge/client/providers/container.provider";
import { useOrpc } from "@fludge/client/providers/orpc.provider";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { HttpClientIamRepository } from "./repositories/sync-iam.repository";
import { syncContainer } from "./repositories/container";
import { tryCatch } from "@fludge/utils/trycatch";
import { MINUTE } from "@fludge/utils/constants";
import { Suspense } from "react";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import { View } from "react-native";
import { Text } from "@/modules/shared/components/app-text";

export function useSyncIam() {
  const orpc = useOrpc();
  const { session } = useAuth();

  const httpClientIamRepository = new HttpClientIamRepository(orpc);

  return useSuspenseQuery({
    queryKey: ["sync", "iam"],
    queryFn: async () => {
      if (!session.data)
        return {
          error: null,
          success: false,
          syncedAt: null,
        };

      const [lastSyncedAt, errorGetLastSyncedAt] = await tryCatch(
        syncContainer.syncIamRepository.getLastSyncedAt()
      );

      if (errorGetLastSyncedAt)
        return {
          error: errorGetLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      const [values, errorFindLastSyncedAt] = await tryCatch(
        httpClientIamRepository.findLastSyncedAt({
          user: lastSyncedAt.user?.updatedAt ?? null,
          group: lastSyncedAt.group?.updatedAt ?? null,
          member: lastSyncedAt.member?.createdAt ?? null,
          organization: lastSyncedAt.organization?.updatedAt ?? null,
          groupMember: lastSyncedAt.groupMember?.createdAt ?? null,
        })
      );

      if (errorFindLastSyncedAt)
        return {
          error: errorFindLastSyncedAt,
          success: false,
          syncedAt: null,
        };

      console.log("values", values);

      const [, erroSaveAll] = await tryCatch(
        syncContainer.syncIamRepository.saveAll(values)
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

export function useInvalidateSync() {
  const queryClient = useQueryClient();

  const invalidateIam = () => {
    queryClient.invalidateQueries({
      queryKey: ["sync", "iam"],
    });
  };

  return { invalidateIam };
}

function SyncSuspense({ children }: { children: React.ReactNode }) {
  const { data } = useSyncIam();

  if (data.error)
    return (
      <View>
        <Text>Retrying</Text>
      </View>
    );

  return children;
}

export function SyncDatabase({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen message="app.loading_iam" />}>
      <SyncSuspense>{children}</SyncSuspense>
    </Suspense>
  );
}
