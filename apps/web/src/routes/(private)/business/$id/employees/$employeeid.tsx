import { createFileRoute, redirect } from "@tanstack/react-router";
import { findOneEmployeeQueryOptions } from "@/core/employees/application/hooks/use.find-one-employee";
import {
  EmployeeScreen,
  WithOutPermissions,
} from "@/core/employees/presentation/screens/employee.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";

export const Route = createFileRoute(
  "/(private)/business/$id/employees/$employeeid"
)({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.user;

    if (!user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    const canReadEmployees = checkUserPermissions(user, ["users:read"]);

    return {
      canReadEmployees,
    };
  },
  loader: async ({ context, params }) => {
    if (!context.canReadEmployees) return;

    const res = await context.queryClient?.ensureQueryData(
      findOneEmployeeQueryOptions({
        businessId: params.id,
        employeeId: params.employeeid,
      })
    );

    if (!res || !res.data) {
      throw redirect({
        to: "/business/$id/employees",
        params: { id: params.id },
      });
    }
  },
});

function RouteComponent() {
  const { id, employeeid } = Route.useParams();
  const { canReadEmployees } = Route.useRouteContext();

  if (!canReadEmployees) {
    return <WithOutPermissions businessId={id} employeeId={employeeid} />;
  }

  return <EmployeeScreen businessId={id} employeeId={employeeid} />;
}
