import { usePermissions } from "@/core/auth/application/providers/permissions.provider";
import { EmployeesScreen } from "@/core/employees/presentation/screens/employees.screen";
import { PageHeader } from "@/core/shared/components/page-header";
import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/employees/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { userHasPermissions } = usePermissions();

  if (!userHasPermissions("users:read")) {
    return (
      <section className="mx-2 space-y-4">
        <PageHeader title="Empleados" />
        <UserHasNoPermissionAlert />
      </section>
    );
  }

  return <EmployeesScreen businessId={id} />;
}
