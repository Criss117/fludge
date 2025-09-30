import { createFileRoute, redirect } from "@tanstack/react-router";
import { findOneProductQueryOptions } from "@/core/products/application/hooks/use.find-one-product";
import {
  ProductScreen,
  WithOutPermissions,
} from "@/core/products/presentation/screens/product.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";

export const Route = createFileRoute(
  "/(private)/business/$id/products/$productid/"
)({
  component: RouteComponent,
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
  loader: async ({ context, params }) => {
    if (!context.canReadProducts) return;

    const product = await context.queryClient
      ?.ensureQueryData(
        findOneProductQueryOptions({
          businessId: params.id,
          productId: params.productid,
        })
      )
      .catch(() => {
        throw redirect({
          to: "/business/$id/products",
          params: {
            id: params.id,
          },
        });
      });

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
  const { canReadProducts } = Route.useRouteContext();

  if (!canReadProducts) {
    return <WithOutPermissions businessId={id} productId={productid} />;
  }

  return <ProductScreen businessId={id} productId={productid} />;
}
