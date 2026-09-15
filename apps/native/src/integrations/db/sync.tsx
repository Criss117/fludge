import { Suspense } from "react";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import { View } from "react-native";
import { Text } from "@/modules/shared/components/app-text";
import { useSyncIam } from "@fludge/client/application/sync/use-sync-iam";

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
