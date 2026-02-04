import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/register-organization")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    context.queryClient.ensureQueryData(
      context.orpc.auth.getSession.queryOptions(),
    );
  },
});

function RouteComponent() {
  return <div></div>;
}
