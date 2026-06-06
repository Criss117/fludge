import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/organization/_layout")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      context.orpc.auth.queries.getSession.queryOptions(),
    );

    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    context.queryClient.prefetchQuery(
      context.orpc.organizations.queries.findAll.queryOptions(),
    );
  },
});

function RouteComponent() {
  return <Outlet />;
}
