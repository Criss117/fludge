import { findOneBusinessAction } from "@/core/business/application/actions/find-one-business.action";
import { sleep } from "@/core/shared/lib/utils";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    console.log(context);
    if (!context.user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
  loader: async ({ params }) => {
    await sleep(2000);

    return findOneBusinessAction(params.id);
  },
  pendingComponent: () => <div>Loading...</div>,
});

function RouteComponent() {
  const { data } = Route.useLoaderData();
  return (
    <>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
      <Outlet />
    </>
  );
}
