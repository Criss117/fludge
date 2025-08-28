import { SignOutButton } from "@/core/shared/components/sign-out-button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SignOutButton />
    </div>
  );
}
