import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";

import { PageHeader, PageHeaderItem } from "@/components/page-header";
import {
  GroupsScreen,
  GroupsScreenSkeleton,
} from "@/modules/iam/screens/groups.screen";
export const Route = createFileRoute("/(dashboard)/_layout/groups/")({
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
        <PageHeaderItem label="Grupos" />
      </PageHeader>
      <Suspense fallback={<GroupsScreenSkeleton />}>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <div>
              <h1>Error</h1>
              <p>{getErrorMessage(error)}</p>
            </div>
          )}
        >
          <GroupsScreen organizationId={activeOrganization.id} />
        </ErrorBoundary>
      </Suspense>
    </main>
  );
}
