import {
  EmployeesScreen,
  WithOutPermissions,
} from "@/core/employees/presentation/screens/employees.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/employees/")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const user = context.user;

    if (!user) {
      throw new Error("No se pudo obtener el usuario");
    }

    const canReadEmployees = checkUserPermissions(user, ["users:read"]);

    return {
      canReadEmployees,
    };
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { canReadEmployees } = Route.useRouteContext();

  if (!canReadEmployees) {
    return <WithOutPermissions businessId={id} />;
  }

  return <EmployeesScreen businessId={id} />;
}
