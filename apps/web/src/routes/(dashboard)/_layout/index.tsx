import { createFileRoute } from "@tanstack/react-router";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@fludge/ui/components/button";
import { useAuth } from "@/integrations/auth/provider";

export const Route = createFileRoute("/(dashboard)/_layout/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { signOut } = useAuth();

  return (
    <div>
      <ModeToggle />
      <Button
        onClick={() => {
          signOut.mutate();
        }}
      >
        Sign Out
      </Button>
    </div>
  );
}
