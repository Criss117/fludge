import { Suspense } from "react";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import { View } from "react-native";
import { Text } from "@/modules/shared/components/app-text";
import { useSyncIam } from "@fludge/client/sync/use-sync-iam";
import { useSyncCatalog } from "@fludge/client/sync/use-sync-catalog";
import { useSyncCommerce } from "@fludge/client/sync/use-sync-commerce";

function SyncIamSuspense({ children }: { children: React.ReactNode }) {
  const { data } = useSyncIam();

  if (data.error)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Retrying Iam {data.error.message}</Text>
      </View>
    );

  return children;
}

function SyncCatalogSuspense({ children }: { children: React.ReactNode }) {
  const { data } = useSyncCatalog();

  if (data.error)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>
          Retrying Catalog {JSON.stringify(data.error.message, null, 2)}
        </Text>
      </View>
    );

  return children;
}

function SyncCommerceSuspense({ children }: { children: React.ReactNode }) {
  const { data } = useSyncCommerce();

  if (data.error)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Retrying Commerce {JSON.stringify(data.error, null, 2)}</Text>
      </View>
    );

  return children;
}

export function SyncDatabase({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen message="app.loading_iam" />}>
      <SyncIamSuspense>
        <Suspense fallback={<LoadingScreen message="app.loading_catalog" />}>
          <SyncCatalogSuspense>
            <Suspense
              fallback={<LoadingScreen message="app.loading_commerce" />}
            >
              <SyncCommerceSuspense>{children}</SyncCommerceSuspense>
            </Suspense>
          </SyncCatalogSuspense>
        </Suspense>
      </SyncIamSuspense>
    </Suspense>
  );
}
