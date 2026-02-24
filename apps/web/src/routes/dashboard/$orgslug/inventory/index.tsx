import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$orgslug/inventory/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgslug } = Route.useParams();

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Inventory">
        <DashBoardHeader.Home />
        <DashBoardHeader.Inventory />
      </DashBoardHeader.Content>
    </>
  );
}
