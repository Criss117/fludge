import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/sales")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(private)/business/$id/sales"!</div>;
}
