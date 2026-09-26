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
      <View>
        <Text>Retrying Iam</Text>
      </View>
    );

  return children;
}

function SyncCatalogSuspense({ children }: { children: React.ReactNode }) {
  const { data } = useSyncCatalog();

  if (data.error)
    return (
      <View>
        <Text>Retrying Catalog</Text>
      </View>
    );

  return children;
}

function SyncCommerceSuspense({ children }: { children: React.ReactNode }) {
  const { data } = useSyncCommerce();

  if (data.error)
    return (
      <View>
        <Text>Retrying Commerce {data.error.message}</Text>
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
