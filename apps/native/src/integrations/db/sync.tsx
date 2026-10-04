import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import { Text } from "@/modules/shared/components/app-text";
import { SyncDatabaseProvider } from "@fludge/client/providers/sync-database.provider";

export function SyncDatabase({ children }: { children: React.ReactNode }) {
  return (
    <SyncDatabaseProvider
      IamFallback={<LoadingScreen message="app.loading_iam" />}
      CatalogFallback={<LoadingScreen message="app.loading_catalog" />}
      CommerceFallback={<LoadingScreen message="app.loading_commerce" />}
      UserScopeFallback={<LoadingScreen message="app.loading_user_scope" />}

      UserScopeErrorComponent={({ error }) => (
        <Text>Retrying UserScope {JSON.stringify(error, null, 2)}</Text>
      )}
      IamErrorComponent={({ error }) => (
        <Text>Retrying Iam {JSON.stringify(error, null, 2)}</Text>
      )}
      CatalogErrorComponent={({ error }) => (
        <Text>Retrying Catalog {JSON.stringify(error, null, 2)}</Text>
      )}
      CommerceErrorComponent={({ error }) => (
        <Text>Retrying Commerce {JSON.stringify(error, null, 2)}</Text>
      )}
    >
      {children}
    </SyncDatabaseProvider>
  );
}
