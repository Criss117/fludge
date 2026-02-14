import { RegisterOrganizationScreen } from "@/modules/organizations/presentation/screens/register-organization.screen";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/register-organization")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = context.auth.session;

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
      organizations: context.organizations,
    };
  },
});

function RouteComponent() {
  const { organizations } = Route.useLoaderData();

  return <RegisterOrganizationScreen organizations={organizations} />;
}
