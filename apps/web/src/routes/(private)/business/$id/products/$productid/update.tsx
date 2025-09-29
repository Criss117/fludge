import { UpdateProductScreen } from "@/core/products/presentation/screens/update-product.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(private)/business/$id/products/$productid/update"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { id, productid } = Route.useParams();

  return <UpdateProductScreen businessId={id} productId={productid} />;
}
