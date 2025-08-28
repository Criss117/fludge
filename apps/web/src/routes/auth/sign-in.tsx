import { SignInRootUser } from "@/core/auth/presentation/screens/sign-in-root-user";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-in")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.user) {
      throw redirect({
        to: "/business/register",
      });
    }
  },
});

function RouteComponent() {
  return <SignInRootUser />;
}
