import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_layout")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      context.orpc.auth.queries.getSession.queryOptions(),
    );

    if (session) {
      throw redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
