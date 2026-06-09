import { createFileRoute, redirect } from "@tanstack/react-router";

import {
  SelectOrganizationScreen,
  SelectOrganizationScreenSkeleton,
} from "@/modules/iam/screens/select-organization.screen";

export const Route = createFileRoute("/organization/_layout/select")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const organizations = await context.queryClient.ensureQueryData(
      context.orpc.organizations.queries.findAll.queryOptions(),
    );

    if (organizations.length === 0) {
      throw redirect({
        to: "/organization/register",
      });
    }

    return {
      organizations,
    };
  },
  loader: async ({ context }) => {
    return context.organizations;
  },
  pendingComponent: SelectOrganizationScreenSkeleton,
});

function RouteComponent() {
  const organizations = Route.useLoaderData();

  return <SelectOrganizationScreen organizations={organizations} />;
}
