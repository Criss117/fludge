import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  GroupScreen,
  WithOutPermissions,
} from "@/core/business/presentation/screens/group.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";
import { findOneGroupQueryOptions } from "@/core/business/application/hooks/use.find-one-group";

export const Route = createFileRoute("/(private)/business/$id/groups/$groupid")(
  {
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
      const user = context.user;

      if (!user) {
        throw redirect({
          to: "/auth/sign-in",
        });
      }

      const canReadGroups = checkUserPermissions(user, ["groups:read"]);

      return {
        canReadGroups,
      };
    },
    loader: async ({ context, params }) => {
      const res = await context.queryClient?.ensureQueryData(
        findOneGroupQueryOptions(params.id, params.groupid)
      );

      if (!res || !res.data) {
        throw redirect({
          to: "/business/$id/groups",
          params: { id: params.id },
        });
      }
    },
    pendingComponent: () => <div>Loading...</div>,
  }
);

function RouteComponent() {
  const { groupid, id } = Route.useParams();
  const { canReadGroups } = Route.useRouteContext();

  if (!canReadGroups) {
    return <WithOutPermissions businessId={id} groupId={groupid} />;
  }

  return <GroupScreen groupId={groupid} businessId={id} />;
}
