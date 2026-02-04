import { RegisterScreen } from "@/modules/auth/presentation/screens/register.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RegisterScreen />;
}
