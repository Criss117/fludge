import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/config")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>page 2</div>;
}
