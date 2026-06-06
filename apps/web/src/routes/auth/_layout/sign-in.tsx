import { SignInScreen } from "@/modules/iam/screens/sign-in.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_layout/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignInScreen />;
}
