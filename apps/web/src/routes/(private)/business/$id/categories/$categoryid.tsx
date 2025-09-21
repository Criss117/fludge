import { createFileRoute, redirect } from "@tanstack/react-router";
import { findOneCategoryQueryOptions } from "@/core/products/application/hooks/use.find-one-category";
import { CategoryScreen } from "@/core/products/presentation/screens/category.screen";

export const Route = createFileRoute(
  "/(private)/business/$id/categories/$categoryid"
)({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
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

  return <CategoryScreen businessId={id} categoryId={categoryid} />;
}
