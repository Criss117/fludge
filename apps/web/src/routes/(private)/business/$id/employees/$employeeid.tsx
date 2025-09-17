import { createFileRoute, redirect } from "@tanstack/react-router";
import { findOneEmployeeQueryOptions } from "@/core/employees/application/hooks/use.find-one-employee";
import { EmployeeScreen } from "@/core/employees/presentation/screens/employee.screen";

export const Route = createFileRoute(
  "/(private)/business/$id/employees/$employeeid"
)({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const { id, employeeid } = params;

    if (!context.queryClient) {
      return;
    }

    const res = await context.queryClient.ensureQueryData(
      findOneEmployeeQueryOptions({
        businessId: id,
        employeeId: employeeid,
      })
    );

    if (res.error) {
      throw redirect({
        to: "/business/$id",
        params: { id },
      });
    }
  },
});

function RouteComponent() {
  const { id, employeeid } = Route.useParams();

  return <EmployeeScreen businessId={id} employeeId={employeeid} />;
}
