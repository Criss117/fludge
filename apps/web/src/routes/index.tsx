import { authClient } from "@/integrations/auth";
import { LoginScreen } from "@/modules/auth/presentation/screens/login.screen";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(
      context.orpc.auth.getSession.queryOptions(),
    );

    if (!session) return;

    if (!session.organizations.length)
      throw redirect({
        to: "/register-organization",
      });

    const hasActiveOrg = session.organizations.find(
      (org) => org.id === session.activeOrganizationId,
    );

    if (hasActiveOrg)
      throw redirect({
        to: "/dashboard/$orgslug",
        params: { orgslug: hasActiveOrg.slug },
      });

    throw redirect({
      to: "/select-organization",
    });
  },
});

function HomeComponent() {
  return <LoginScreen />;
}
