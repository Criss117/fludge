import {
  CreateProductScreen,
  WithOutPermissions,
} from "@/core/products/presentation/screens/create-product.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/business/$id/products/create")(
  {
    component: RouteComponent,
    beforeLoad: ({ context }) => {
      const user = context.user;

      if (!user) {
        throw redirect({
          to: "/auth/sign-in",
        });
      }

      const canCreateProducts = checkUserPermissions(user, [
        "products:create",
        "categories:read",
      ]);

      return {
        canCreateProducts,
      };
    },
  }
);

function RouteComponent() {
  const { id } = Route.useParams();
  const { canCreateProducts } = Route.useRouteContext();

  if (!canCreateProducts) {
    return <WithOutPermissions businessId={id} />;
  }

  return <CreateProductScreen businessId={id} />;
}
