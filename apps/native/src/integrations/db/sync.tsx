import { LoadingScreen } from "@/core/shared/components/loading-screen";
import { ThemedText } from "@/core/shared/components/themed-text";
import { SyncDatabaseProvider } from "@fludge/client/providers/sync-database.provider";

export function SyncDatabase({ children }: { children: React.ReactNode }) {
  return (
    <SyncDatabaseProvider
      IamFallback={<LoadingScreen message="app.loading.iam" />}
      CatalogFallback={<LoadingScreen message="app.loading.catalog" />}
      CommerceFallback={<LoadingScreen message="app.loading.commerce" />}
      UserScopeFallback={<LoadingScreen message="app.loading.user_scope" />}

      UserScopeErrorComponent={({ error }) => (
        <ThemedText>
          Retrying UserScope {JSON.stringify(error, null, 2)}
        </ThemedText>
      )}
      IamErrorComponent={({ error }) => (
        <ThemedText>Retrying Iam {JSON.stringify(error, null, 2)}</ThemedText>
      )}
      CatalogErrorComponent={({ error }) => (
        <ThemedText>
          Retrying Catalog {JSON.stringify(error, null, 2)}
        </ThemedText>
      )}
      CommerceErrorComponent={({ error }) => (
        <ThemedText>
          Retrying Commerce {JSON.stringify(error, null, 2)}
        </ThemedText>
      )}
    >
      {children}
    </SyncDatabaseProvider>
  );
}
