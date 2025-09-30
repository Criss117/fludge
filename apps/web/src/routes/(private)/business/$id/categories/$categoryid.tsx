import { createFileRoute, redirect } from "@tanstack/react-router";
import { findOneCategoryQueryOptions } from "@/core/products/application/hooks/use.find-one-category";
import {
  CategoryScreen,
  WithOutPermissions,
} from "@/core/products/presentation/screens/category.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";

export const Route = createFileRoute(
  "/(private)/business/$id/categories/$categoryid"
)({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const user = context.user;

    if (!user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    const canReadCategory = checkUserPermissions(user, ["categories:read"]);

    return {
      canReadCategory,
    };
  },
  loader: async ({ context, params }) => {
    if (!context.canReadCategory) return;

    const res = await context.queryClient?.ensureQueryData(
      findOneCategoryQueryOptions(params.id, params.categoryid)
    );

    if (!res || !res.data) {
      throw redirect({
        to: "/business/$id/categories",
        params: { id: params.id },
      });
    }
  },
  pendingComponent: () => <div>Loading category...</div>,
});

function RouteComponent() {
  const { id, categoryid } = Route.useParams();
  const { canReadCategory } = Route.useRouteContext();

  if (!canReadCategory)
    return <WithOutPermissions businessId={id} categoryId={categoryid} />;

  return <CategoryScreen businessId={id} categoryId={categoryid} />;
}
