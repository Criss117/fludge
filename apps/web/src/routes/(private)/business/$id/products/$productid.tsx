import { createFileRoute, redirect } from "@tanstack/react-router";
import { findOneProductQueryOptions } from "@/core/products/application/hooks/use.find-one-product";
import { ProductScreen } from "@/core/products/presentation/screens/product.screen";

export const Route = createFileRoute(
  "/(private)/business/$id/products/$productid"
)({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const product = await context.queryClient?.ensureQueryData(
      findOneProductQueryOptions({
        businessId: params.id,
        productId: params.productid,
      })
    );

    if (!product) {
      throw redirect({
        to: "/business/$id/products",
        params: {
          id: params.id,
        },
      });
    }
  },
  pendingComponent: () => <div>Loading...</div>,
});

function RouteComponent() {
  const { id, productid } = Route.useParams();

  return <ProductScreen businessId={id} productId={productid} />;
}
