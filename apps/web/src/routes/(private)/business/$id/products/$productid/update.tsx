import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  UpdateProductScreen,
  WithOutPermissions,
} from "@/core/products/presentation/screens/update-product.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";

export const Route = createFileRoute(
  "/(private)/business/$id/products/$productid/update"
)({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const user = context.user;

    if (!user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    const canReadProducts = checkUserPermissions(user, [
      "products:read",
      "categories:read",
    ]);

    return {
      canReadProducts,
    };
  },
});

function RouteComponent() {
  const { id, productid } = Route.useParams();
  const { canReadProducts } = Route.useRouteContext();

  if (!canReadProducts) {
    return <WithOutPermissions businessId={id} productId={productid} />;
  }

  return <UpdateProductScreen businessId={id} productId={productid} />;
}
