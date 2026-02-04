import { LoginScreen } from "@/modules/auth/presentation/screens/login.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return <LoginScreen />;
}
