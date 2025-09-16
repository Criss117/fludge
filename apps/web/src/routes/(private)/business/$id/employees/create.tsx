import { createFileRoute } from "@tanstack/react-router";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";
import { CreateEmployeeScreen } from "@/core/employees/presentation/screens/create-employee.screen";
import { PageHeader } from "@/core/shared/components/page-header";
import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";

export const Route = createFileRoute(
  "/(private)/business/$id/employees/create"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { userHasPermissions } = usePermissions();

  if (!userHasPermissions("users:create")) {
    return (
      <section className="mx-2 space-y-4">
        <PageHeader title="Nuevo empleado" />
        <UserHasNoPermissionAlert />
      </section>
    );
  }

  return <CreateEmployeeScreen businessId={id} />;
}
