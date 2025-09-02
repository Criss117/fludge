import { createFileRoute } from "@tanstack/react-router";
import { HomeScreen } from "@/core/business/presentation/screens/home.screen";

export const Route = createFileRoute("/(private)/business/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <HomeScreen businessId={id} />;
}
