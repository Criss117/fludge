import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/register-organization")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div></div>;
}
