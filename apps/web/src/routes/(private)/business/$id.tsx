import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  findOneBusinessQueryOptions,
  useFindOneBusiness,
} from "@/core/business/application/hooks/use.find-one-business";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/core/shared/components/ui/sidebar";
import { BusinessSidebar } from "@/core/business/presentation/components/business-sidebar";

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
    const d = await context.queryClient?.ensureQueryData(
      findOneBusinessQueryOptions(params.id)
    );

    if (!d?.data) {
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
        <SidebarTrigger />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
