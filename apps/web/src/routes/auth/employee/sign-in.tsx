import { SignInEMployeeUserScreen } from "@/core/auth/presentation/screens/sign-in-employee-user.screen";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/employee/sign-in")({
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

    if (user.isEmployeeIn.length) {
      throw redirect({
        to: "/business/$id",
        params: {
          id: user.isEmployeeIn[0].id,
        },
      });
    }
  },
});

function RouteComponent() {
  return <SignInEMployeeUserScreen />;
}
