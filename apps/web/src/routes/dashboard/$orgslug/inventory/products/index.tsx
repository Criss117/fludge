import { createFileRoute } from "@tanstack/react-router";

import { ProductsScreen } from "@inventory/presentation/screens/products.screen";

import { DashBoardHeader } from "@shared/components/dashboard-header";

export const Route = createFileRoute("/dashboard/$orgslug/inventory/products/")(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  const { orgslug } = Route.useParams();

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Products">
        <DashBoardHeader.Home />
        <DashBoardHeader.Inventory />
        <DashBoardHeader.Products />
      </DashBoardHeader.Content>
      <ProductsScreen />
    </>
  );
}
