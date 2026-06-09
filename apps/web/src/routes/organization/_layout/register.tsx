import {
  RegisterOrganizationScreen,
  RegisterOrganizationScreenSkeleton,
} from "@/modules/iam/screens/register-organization.screen";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/organization/_layout/register")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.session.user.isRoot)
      throw redirect({ to: "/organization/select" });

    const organizations = await context.queryClient.ensureQueryData(
      context.orpc.organizations.queries.findAll.queryOptions(),
    );

    return {
      organizations,
    };
  },
  loader: async ({ context }) => {
    return context.organizations;
  },
  pendingComponent: RegisterOrganizationScreenSkeleton,
});

function RouteComponent() {
  return <RegisterOrganizationScreen />;
}
