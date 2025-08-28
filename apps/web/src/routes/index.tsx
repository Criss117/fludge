import { Button } from "@/core/shared/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Button>Hello "/"!</Button>
    </div>
  );
}
