import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  findOneBusinessQueryOptions,
  useFindOneBusiness,
} from "@/core/business/application/hooks/use.find-one-business";
import {
  SidebarInset,
  SidebarProvider,
} from "@/core/shared/components/ui/sidebar";
import { BusinessSidebar } from "@/core/business/presentation/components/business-sidebar";
import { findAllPermissionsQueryOptions } from "@/core/business/application/hooks/use.find-all-permissions";

export const Route = createFileRoute("/(private)/business/$id")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
  loader: async ({ params, context }) => {
    const prefectchBusinessPromise = context.queryClient?.ensureQueryData(
      findOneBusinessQueryOptions(params.id)
    );

    const permissionsPrefetchPromise = context.queryClient?.ensureQueryData(
      findAllPermissionsQueryOptions
    );

    const [businessPrefeched] = await Promise.all([
      prefectchBusinessPromise,
      permissionsPrefetchPromise,
    ]);

    if (!businessPrefeched?.data) {
      throw redirect({
        to: "/",
      });
    }
  },
  pendingComponent: () => <div>Loading...</div>,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data } = useFindOneBusiness(id);

  if (!data) {
    return <div>Not found</div>;
  }

  return (
    <SidebarProvider>
      <BusinessSidebar currentBusiness={data} />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
