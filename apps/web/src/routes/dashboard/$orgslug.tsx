import { authClient } from "@/integrations/auth";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$orgslug")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      context.orpc.auth.getSession.queryOptions(),
    );

    if (!session)
      throw redirect({
        to: "/",
      });

    return {
      ...session,
    };
  },
  loader: async ({ context, params }) => {
    const orgs = context.orgs;

    if (!orgs?.length)
      throw redirect({ to: "/dashboard/register-organization" });

    const selectedOrg = orgs.find((org) => org.slug === params.orgslug);

    if (!selectedOrg) throw redirect({ to: "/dashboard/select-organization" });

    const isSameActiveOrg =
      selectedOrg.id === context.session.activeOrganizationId;

    if (!isSameActiveOrg) {
      await authClient.organization.setActive({
        organizationId: selectedOrg.id,
        organizationSlug: selectedOrg.slug,
        fetchOptions: {
          onSuccess: () => {
            context.queryClient.invalidateQueries(
              context.orpc.auth.getSession.queryOptions(),
            );
          },
        },
      });
    }
  },
  pendingComponent: () => <div>Loading...</div>,
});

function RouteComponent() {
  return <Outlet />;
}
