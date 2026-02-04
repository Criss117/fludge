import { SignInScreen } from "@/modules/auth/presentation/screens/sign-in.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return <SignInScreen />;
}
