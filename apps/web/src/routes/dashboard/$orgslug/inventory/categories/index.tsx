import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/dashboard/$orgslug/inventory/categories/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgslug } = Route.useParams();

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Categories">
        <DashBoardHeader.Home />
        <DashBoardHeader.Inventory />
        <DashBoardHeader.Categories />
      </DashBoardHeader.Content>
    </>
  );
}
