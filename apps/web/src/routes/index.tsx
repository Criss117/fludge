import { authClient } from "@/integrations/auth";
import { LoginScreen } from "@/modules/auth/presentation/screens/login.screen";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  beforeLoad: async ({ context }) => {
    const authData = await context.queryClient.fetchQuery(
      context.orpc.auth.getSession.queryOptions(),
    );

    if (authData) {
      throw redirect({
        to: "/dashboard/register-organization",
      });
    }
  },
});

function HomeComponent() {
  return <LoginScreen />;
}
