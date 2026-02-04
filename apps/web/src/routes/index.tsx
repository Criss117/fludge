import { orpc } from "@/integrations/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { data } = useQuery(orpc.healthCheck.queryOptions());

  return <div>{data}</div>;
}
