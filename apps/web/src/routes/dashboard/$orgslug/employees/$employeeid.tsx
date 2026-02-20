import { createFileRoute, redirect } from "@tanstack/react-router";
import { employeesCollectionBuilder } from "@/modules/employees/application/collections/employees.collection";
import { EmployeeScreen } from "@/modules/employees/presentation/screens/employee.screen";
import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { useEmployeesQueries } from "@/modules/employees/application/hooks/use-employees-queries";
import { useLiveSuspenseQuery } from "@tanstack/react-db";

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
  const { findOneEmployee } = useEmployeesQueries();
  const { data: employee } = useLiveSuspenseQuery(
    () => findOneEmployee(employeeid),
    [employeeid],
  );

  if (!employee) return null;

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Employee">
        <DashBoardHeader.Home />
        <DashBoardHeader.Employees />
        <DashBoardHeader.Employee label={employee.user.name} />
      </DashBoardHeader.Content>
      <EmployeeScreen employee={employee} />
    </>
  );
}
