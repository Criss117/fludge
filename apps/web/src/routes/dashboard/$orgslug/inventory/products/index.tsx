import { ProductsScreen } from "@/modules/inventory/presentation/screens/products.screen";
import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { createFileRoute } from "@tanstack/react-router";

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
