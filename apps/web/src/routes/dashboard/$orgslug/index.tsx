import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$orgslug/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/$orgslug/"dxd!</div>;
}
