import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/select-business")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    console.log(context);
    if (!context.user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
});

function RouteComponent() {
  return <div>Hello "/(private)/business/select-business"!</div>;
}
