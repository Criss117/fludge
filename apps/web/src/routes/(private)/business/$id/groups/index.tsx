import { createFileRoute } from "@tanstack/react-router";
import {
  GroupsScreen,
  WithOutPermissionsGroupsScreen,
} from "@/core/business/presentation/screens/groups.screen";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";

export const Route = createFileRoute("/(private)/business/$id/groups/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { userHasPermissions } = usePermissions();

  if (!userHasPermissions("groups:read")) {
    return <WithOutPermissionsGroupsScreen />;
  }

  return <GroupsScreen businessId={id} />;
}
