import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  CategoriesScreen,
  WithOutPermissions,
} from "@/core/products/presentation/screens/categories.screen";
import { checkUserPermissions } from "@/core/shared/lib/user-permission";

export const Route = createFileRoute("/(private)/business/$id/categories/")({
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
  pendingComponent: () => <div>Loading categories...</div>,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { canReadCategory } = Route.useRouteContext();

  if (!canReadCategory) {
    return <WithOutPermissions businessId={id} />;
  }

  return <CategoriesScreen businessId={id} />;
}
