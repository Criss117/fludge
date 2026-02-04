import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/_layout")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const authData = await context.queryClient.fetchQuery(
      context.orpc.auth.getSession.queryOptions(),
    );

    if (!authData) {
      throw redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  return (
    <div>
      Hello "/dashboard/_layout"!
      <Outlet />
    </div>
  );
}
