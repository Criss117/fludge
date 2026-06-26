import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";

import { PageHeader, PageHeaderItem } from "@/components/page-header";
import {
  ProductsScreen,
  ProductsScreenSkeleton,
} from "@/modules/catalog/screens/products.screen";

export const Route = createFileRoute("/(dashboard)/_layout/products/")({
  component: RouteComponent,
  loader: ({ context }) => {
    return context.activeOrganization;
  },
});

function RouteComponent() {
  const activeOrganization = Route.useLoaderData();

  return (
    <main>
      <PageHeader>
        <PageHeaderItem label="Productos" />
      </PageHeader>
      <Suspense fallback={<ProductsScreenSkeleton />}>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <div>
              <h1>Error</h1>
              <p>{getErrorMessage(error)}</p>
            </div>
          )}
        >
          <ProductsScreen organizationId={activeOrganization.id} />
        </ErrorBoundary>
      </Suspense>
    </main>
  );
}