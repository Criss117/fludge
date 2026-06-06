import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_layout")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = context.session;

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
