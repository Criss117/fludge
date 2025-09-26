import { CreateProductScreen } from "@/core/products/presentation/screens/create-product.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/products/create")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const { id } = Route.useParams();

  return <CreateProductScreen businessId={id} />;
}
