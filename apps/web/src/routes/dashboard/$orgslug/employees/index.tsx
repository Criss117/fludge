import { createFileRoute } from "@tanstack/react-router";
import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { EmployeesScreen } from "@/modules/employees/presentation/screens/employees.screen";

export const Route = createFileRoute("/dashboard/$orgslug/employees/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgslug } = Route.useParams();

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Employees">
        <DashBoardHeader.Home />
        <DashBoardHeader.Employees />
      </DashBoardHeader.Content>
      <EmployeesScreen orgSlug={orgslug} />
    </>
  );
}
