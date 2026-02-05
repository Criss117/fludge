import { authClient } from "@/integrations/auth";
import { LoginScreen } from "@/modules/auth/presentation/screens/login.screen";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  beforeLoad: async ({ context }) => {
    const authData = await context.queryClient.fetchQuery(
      context.orpc.auth.getSession.queryOptions(),
    );

    if (!authData) return;

    if (!authData.orgs.length)
      throw redirect({
        to: "/dashboard/register-organization",
      });

    const hasActiveOrg = authData.orgs.find(
      (org) => org.id === authData.session.activeOrganizationId,
    );

    if (hasActiveOrg)
      throw redirect({
        to: "/dashboard/$orgslug",
        params: { orgslug: hasActiveOrg.slug },
      });

    throw redirect({
      to: "/dashboard/select-organization",
    });
  },
});

function HomeComponent() {
  return <LoginScreen />;
}
