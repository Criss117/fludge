import { createFileRoute } from "@tanstack/react-router";
import {
  CreateEmployeeScreen,
  WithOutPermissions,
} from "@/core/employees/presentation/screens/create-employee.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";

export const Route = createFileRoute(
  "/(private)/business/$id/employees/create"
)({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const user = context.user;

    if (!user) {
      throw new Error("No se pudo obtener el usuario");
    }

    const canCreateEmployee = checkUserPermissions(user, ["users:create"]);

    return {
      canCreateEmployee,
    };
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { canCreateEmployee } = Route.useRouteContext();

  if (!canCreateEmployee) {
    return <WithOutPermissions businessId={id} />;
  }

  return <CreateEmployeeScreen businessId={id} />;
}
