import { createFileRoute, redirect } from "@tanstack/react-router";
import { CategoriesScreen } from "@/core/products/presentation/screens/categories.screen";
import { findManyCategoriesQueryOptions } from "@/core/products/application/hooks/use.find-many-categories";

export const Route = createFileRoute("/(private)/business/$id/categories/")({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const res = await context.queryClient?.ensureQueryData(
      findManyCategoriesQueryOptions(params.id)
    );

    if (!res || !res.data) {
      throw redirect({
        to: "/business/$id",
        params: { id: params.id },
      });
    }
  },
  pendingComponent: () => <div>Loading categories...</div>,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return <CategoriesScreen businessId={id} />;
}
