import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/pos")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(dashboard)/_layout/pos"!</div>;
}
