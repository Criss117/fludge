import { createFileRoute, redirect } from "@tanstack/react-router";
import { RegisterBusinessScreen } from "@/core/business/presentation/screens/register-business.screen";

export const Route = createFileRoute("/(private)/business/register")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
});

function RouteComponent() {
  return <RegisterBusinessScreen />;
}
