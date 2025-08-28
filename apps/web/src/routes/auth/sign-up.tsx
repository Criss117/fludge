import { SignUpScreen } from "@/core/auth/presentation/screens/sign-up.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUpScreen />;
}
