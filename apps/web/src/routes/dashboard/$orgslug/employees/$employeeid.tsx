import { createFileRoute, redirect } from "@tanstack/react-router";

import { DashBoardHeader } from "@shared/components/dashboard-header";

import { EmployeeScreen } from "@employees/presentation/screens/employee.screen";
import { useFindOneEmployee } from "@employees/application/hooks/use-employees-queries";
import { employeesCollectionBuilder } from "@employees/application/collections/employees.collection";

export const Route = createFileRoute(
  "/dashboard/$orgslug/employees/$employeeid",
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const employeesCollection = employeesCollectionBuilder(
      context.selectedOrganization.id,
    );

    await employeesCollection.preload();

    const employee = Array.from(employeesCollection.entries()).find(
      ([_, employee]) => employee.id === params.employeeid,
    );

    if (!employee)
      throw redirect({
        to: "/dashboard/$orgslug/employees",
        params: { orgslug: params.orgslug },
      });

    return { employee };
  },
});

function RouteComponent() {
  const { orgslug, employeeid } = Route.useParams();

  const employee = useFindOneEmployee(employeeid);

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Employee">
        <DashBoardHeader.Home />
        <DashBoardHeader.Employees />
        <DashBoardHeader.Employee label={employee.user.name} />
      </DashBoardHeader.Content>
      <EmployeeScreen employee={employee} orgSlug={orgslug} />
    </>
  );
}
