import { RegisterOrganizationScreen } from "@/modules/organizations/presentation/screens/register-organization.screen";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/register-organization")({
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
    return {
      orgs: context.orgs,
    };
  },
});

function RouteComponent() {
  const { orgs } = Route.useLoaderData();

  return <RegisterOrganizationScreen orgs={orgs} />;
}
