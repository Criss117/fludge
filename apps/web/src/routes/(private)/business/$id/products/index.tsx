import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  ProductsScreen,
  WithOutPermissions,
} from "@/core/products/presentation/screens/products.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";

export const Route = createFileRoute("/(private)/business/$id/products/")({
  component: RouteComponent,
  pendingComponent: () => <div>Cargando from router...</div>,
  beforeLoad: ({ context }) => {
    const user = context.user;

    if (!user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    const canReadProducts = checkUserPermissions(user, ["products:read"]);

    return {
      canReadProducts,
    };
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { canReadProducts } = Route.useRouteContext();

  if (!canReadProducts) {
    return <WithOutPermissions businessId={id} />;
  }

  return <ProductsScreen businessId={id} />;
}
