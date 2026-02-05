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
    const orgs = await context.queryClient.ensureQueryData(
      context.orpc.organizations.findAll.queryOptions(),
    );

    if (!orgs?.length)
      throw redirect({ to: "/dashboard/register-organization" });

    if (!context.session.activeOrganizationId)
      throw redirect({
        to: "/dashboard/select-organization",
      });

    const isInActiveOrg =
      context.session.activeOrganizationId === params.orgslug;

    if (!isInActiveOrg)
      throw redirect({
        to: "/dashboard/$orgslug",
        params: { orgslug: context.session.activeOrganizationId },
      });
  },
  pendingComponent: () => <div>Loading...</div>,
});

function RouteComponent() {
  return <Outlet />;
}
