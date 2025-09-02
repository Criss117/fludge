import { SignInRootUser } from "@/core/auth/presentation/screens/sign-in-root-user";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-in")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const { user } = context;

    if (!user) return;

    if (user.isRoot) {
      if (user.isRootIn.length === 0) {
        throw redirect({
          to: "/business/register",
        });
      }

      if (user.isRootIn.length === 1) {
        throw redirect({
          to: "/business/$id",
          params: {
            id: user.isRootIn[0].id,
          },
        });
      }

      if (user.isRootIn.length > 1) {
        throw redirect({
          to: "/business/select-business",
        });
      }
    }
  },
});

function RouteComponent() {
  return <SignInRootUser />;
}
