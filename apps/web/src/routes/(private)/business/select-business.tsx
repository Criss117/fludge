import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/select-business")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    if (context.user.isRoot) {
      if (context.user.isRootIn.length === 0) {
        throw redirect({
          to: "/business/register",
        });
      }

      if (context.user.isRootIn.length === 1) {
        throw redirect({
          to: "/business/$id",
          params: {
            id: context.user.isRootIn[0].id,
          },
        });
      }
    }

    if (context.user.isEmployeeIn.length === 1) {
      throw redirect({
        to: "/business/$id",
        params: {
          id: context.user.isEmployeeIn[0].id,
        },
      });
    }
  },
});

function RouteComponent() {
  return <div>Hello "/(private)/business/select-business"!</div>;
}
