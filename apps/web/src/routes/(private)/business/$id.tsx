import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { findOneBusinessAction } from "@/core/business/application/actions/find-one-business.action";

export const Route = createFileRoute("/(private)/business/$id")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
  loader: async ({ params }) => {
    const data = await findOneBusinessAction(params.id);

    if (data.error) {
      throw redirect({
        to: "/business/select-business",
      });
    }

    return data;
  },
  pendingComponent: () => <div>Loading...</div>,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}
