import { findOneGroupQueryOptions } from "@/core/business/application/hooks/use.find-one-group";
import { GroupScreen } from "@/core/business/presentation/screens/group.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/groups/$groupid")(
  {
    component: RouteComponent,
    beforeLoad: async ({ params, context }) => {
      const { queryClient } = context;

      if (!queryClient) {
        throw new Error("queryClient not found");
      }

      await queryClient.ensureQueryData(
        findOneGroupQueryOptions(params.id, params.groupid)
      );
    },
    pendingComponent: () => <div>Loading...</div>,
  }
);

function RouteComponent() {
  const { groupid, id } = Route.useParams();

  return <GroupScreen groupId={groupid} businessId={id} />;
}
