import { createFileRoute } from "@tanstack/react-router";

import { DashBoardHeader } from "@shared/components/dashboard-header";

export const Route = createFileRoute(
  "/dashboard/$orgslug/inventory/suppliers/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgslug } = Route.useParams();

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Suppliers">
        <DashBoardHeader.Home />
        <DashBoardHeader.Inventory />
        <DashBoardHeader.Suppliers />
      </DashBoardHeader.Content>
    </>
  );
}
