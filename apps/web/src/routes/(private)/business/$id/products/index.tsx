import { findManyProductsQueryOptions } from "@/core/products/application/hooks/use.find-many-products";
import { ProductsScreen } from "@/core/products/presentation/screens/products.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/products/")({
  component: RouteComponent,
  pendingComponent: () => <div>Cargando from router...</div>,
  errorComponent: () => <div>Error from router...</div>,
  loader: async ({ context, params }) => {
    const { id } = params;

    await context.queryClient?.ensureQueryData(
      findManyProductsQueryOptions({ businessId: id })
    );
  },
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <ProductsScreen businessId={id} />;
}
