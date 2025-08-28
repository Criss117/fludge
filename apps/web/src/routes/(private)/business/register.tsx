import { SignOutButton } from "@/core/shared/components/sign-out-button";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/register")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    console.log(context);
    if (!context.user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
});

function RouteComponent() {
  return (
    <div>
      <SignOutButton />
    </div>
  );
}
