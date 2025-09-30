import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  GroupsScreen,
  WithOutPermissions,
} from "@/core/business/presentation/screens/groups.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";

export const Route = createFileRoute("/(private)/business/$id/groups/")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const user = context.user;

    if (!user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    const canReadGroup = checkUserPermissions(user, ["groups:read"]);

    return {
      canReadGroup,
    };
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { canReadGroup } = Route.useRouteContext();

  if (!canReadGroup) {
    return <WithOutPermissions businessId={id} />;
  }

  return <GroupsScreen businessId={id} />;
}
