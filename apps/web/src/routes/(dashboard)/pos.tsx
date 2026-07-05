import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";

import {
  PosScreen,
  PosScreenSkeleton,
} from "@/modules/sales/screens/pos.screen";

export const Route = createFileRoute("/(dashboard)/pos")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = context.session;

    if (!session) {
      throw redirect({ to: "/auth/sign-in" });
    }

    if (!session.activeOrganizationId) {
      throw redirect({ to: "/organization/select" });
    }

    const activeOrganization = await context.queryClient.ensureQueryData(
      context.orpc.organizations.queries.findActive.queryOptions(),
    );

    if (!activeOrganization) {
      throw redirect({ to: "/organization/select" });
    }

    return {
      session,
      activeOrganization,
    };
  },
  loader: ({ context }) => {
    return context.activeOrganization;
  },
  pendingComponent: PosScreenSkeleton,
});

function RouteComponent() {
  const activeOrganization = Route.useLoaderData();

  return (
    <main className="h-full">
      <Suspense fallback={<PosScreenSkeleton />}>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <div className="p-8">
              <h1>Error</h1>
              <p>{getErrorMessage(error)}</p>
            </div>
          )}
        >
          <PosScreen organizationId={activeOrganization.id} />
        </ErrorBoundary>
      </Suspense>
    </main>
  );
}