import { createFileRoute } from "@tanstack/react-router";
import {
  CreateGroupScreen,
  WithOutPermissionsCreateGroupScreen,
} from "@/core/business/presentation/screens/create-group.screen";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";

export const Route = createFileRoute("/(private)/business/$id/groups/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { userHasPermissions } = usePermissions();

  if (!userHasPermissions("groups:create")) {
    return <WithOutPermissionsCreateGroupScreen />;
  }

  return <CreateGroupScreen businessId={id} />;
}
