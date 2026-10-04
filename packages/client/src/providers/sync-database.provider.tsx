import { Suspense } from "react";
import { useSyncIam } from "@fludge/client/sync/use-sync-iam";
import { useSyncCatalog } from "@fludge/client/sync/use-sync-catalog";
import { useSyncCommerce } from "@fludge/client/sync/use-sync-commerce";

interface SyncProps {
  ErrorComponent: (props: { error: Error }) => React.ReactNode;
  children: React.ReactNode;
}

function SyncIamSuspense({ children, ErrorComponent }: SyncProps) {
  const { data } = useSyncIam();

  if (data.error) return <ErrorComponent error={data.error} />;

  return children;
}

function SyncCatalogSuspense({ children, ErrorComponent }: SyncProps) {
  const { data } = useSyncCatalog();

  if (data.error) return <ErrorComponent error={data.error} />;

  return children;
}

function SyncCommerceSuspense({ children, ErrorComponent }: SyncProps) {
  const { data } = useSyncCommerce();

  if (data.error) return <ErrorComponent error={data.error} />;

  return children;
}

interface Props {
  IamFallback: React.ReactNode;
  CatalogFallback: React.ReactNode;
  CommerceFallback: React.ReactNode;
  IamErrorComponent: (props: { error: Error }) => React.ReactNode;
  CatalogErrorComponent: (props: { error: Error }) => React.ReactNode;
  CommerceErrorComponent: (props: { error: Error }) => React.ReactNode;
  children: React.ReactNode;
}

export function SyncDatabaseProvider({
  CatalogFallback,
  CommerceFallback,
  IamFallback,
  CatalogErrorComponent,
  CommerceErrorComponent,
  IamErrorComponent,
  children,
}: Props) {
  return (
    <Suspense fallback={IamFallback}>
      <SyncIamSuspense ErrorComponent={IamErrorComponent}>
        <Suspense fallback={CatalogFallback}>
          <SyncCatalogSuspense ErrorComponent={CatalogErrorComponent}>
            <Suspense fallback={CommerceFallback}>
              <SyncCommerceSuspense ErrorComponent={CommerceErrorComponent}>
                {children}
              </SyncCommerceSuspense>
            </Suspense>
          </SyncCatalogSuspense>
        </Suspense>
      </SyncIamSuspense>
    </Suspense>
  );
}
