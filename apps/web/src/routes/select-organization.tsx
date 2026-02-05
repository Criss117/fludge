import { createFileRoute, redirect } from "@tanstack/react-router";
import { SelectOrganizationsScreen } from "@/modules/organizations/presentation/screens/select-organization.screen";

export const Route = createFileRoute("/select-organization")({
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
  loader: ({ context }) => {
    const orgs = context.orgs;

    if (!orgs?.length) throw redirect({ to: "/register-organization" });

    return {
      orgs,
    };
  },
});

function RouteComponent() {
  const { orgs } = Route.useLoaderData();

  return <SelectOrganizationsScreen orgs={orgs} />;
}
