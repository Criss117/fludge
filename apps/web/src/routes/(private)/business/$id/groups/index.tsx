import { createFileRoute } from "@tanstack/react-router";
import { GroupsScreen } from "@/core/business/presentation/screens/groups.screen";

export const Route = createFileRoute("/(private)/business/$id/groups/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <GroupsScreen businessId={id} />;
}
