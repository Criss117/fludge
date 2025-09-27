import { createFileRoute } from "@tanstack/react-router";
import { ProductsScreen } from "@/core/products/presentation/screens/products.screen";

export const Route = createFileRoute("/(private)/business/$id/products/")({
  component: RouteComponent,
  pendingComponent: () => <div>Cargando from router...</div>,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <ProductsScreen businessId={id} />;
}
