import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  CreateGroupScreen,
  WithOutPermissions,
} from "@/core/business/presentation/screens/create-group.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";

export const Route = createFileRoute("/(private)/business/$id/groups/create")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const user = context.user;

    if (!user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    const canCreateGroup = checkUserPermissions(user, ["groups:create"]);

    return {
      canCreateGroup,
    };
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { canCreateGroup } = Route.useRouteContext();

  if (!canCreateGroup) {
    return <WithOutPermissions businessId={id} />;
  }

  return <CreateGroupScreen businessId={id} />;
}
