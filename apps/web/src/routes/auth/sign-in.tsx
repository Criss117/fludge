import { LoaderPage } from "@/components/loader-page";
import { SignInScreen } from "@/modules/iam/screens/sign-in.screen";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-in")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.session) return;

    throw redirect({
      to: "/",
    });
  },
  pendingComponent: () => <LoaderPage />,
});

function RouteComponent() {
  return <SignInScreen />;
}
