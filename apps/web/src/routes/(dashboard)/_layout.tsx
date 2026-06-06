import { Outlet, redirect } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@fludge/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/(dashboard)/_layout")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = context.session;

    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    if (!session.activeOrganizationId) {
      throw redirect({
        to: "/organization/select",
      });
    }

    const activeOrganization = await context.queryClient.ensureQueryData(
      context.orpc.organizations.queries.findActive.queryOptions(),
    );

    if (!activeOrganization) {
      throw redirect({
        to: "/organization/select",
      });
    }

    return {
      session,
      activeOrganization,
    };
  },
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
