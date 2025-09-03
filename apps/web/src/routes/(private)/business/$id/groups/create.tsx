import { CreateGroupScreen } from "@/core/business/presentation/screens/create-group.screen";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/groups/create")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const { user } = context;

    if (!user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <CreateGroupScreen businessId={id} />;
}
