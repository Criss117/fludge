import { orpc } from "@/integrations/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { data, error } = useQuery(
    orpc.organizations.sayHi.queryOptions({
      input: {
        name: "Cristian",
      },
    }),
  );

  return (
    <div>
      {data}
      <pre>
        <code>{JSON.stringify(error, null, 2)}</code>
      </pre>
    </div>
  );
}
