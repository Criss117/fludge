import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@fludge/client/modules/hooks/use-session";
import { ModeToggle } from "@/components/mode-toggle";

export const Route = createFileRoute("/(dashboard)/_layout/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSession();

  return (
    <div>
      <ModeToggle />

      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
}
