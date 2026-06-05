import { createFileRoute } from "@tanstack/react-router";
import { ModeToggle } from "@/components/mode-toggle";

export const Route = createFileRoute("/(dashboard)/_layout/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <ModeToggle />
    </div>
  );
}
