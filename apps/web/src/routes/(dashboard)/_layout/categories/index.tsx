import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";

import { PageHeader, PageHeaderItem } from "@/components/page-header";
import {
  CategoriesScreen,
  CategoriesScreenSkeleton,
} from "@/modules/catalog/screens/categories.screen";

export const Route = createFileRoute("/(dashboard)/_layout/categories/")({
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
        <PageHeaderItem label="Categorías" />
      </PageHeader>
      <Suspense fallback={<CategoriesScreenSkeleton />}>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <div>
              <h1>Error</h1>
              <p>{getErrorMessage(error)}</p>
            </div>
          )}
        >
          <CategoriesScreen organizationId={activeOrganization.id} />
        </ErrorBoundary>
      </Suspense>
    </main>
  );
}
