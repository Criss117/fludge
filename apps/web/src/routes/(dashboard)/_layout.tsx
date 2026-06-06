import { Outlet, redirect } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@fludge/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/(dashboard)/_layout")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.session) return;

    throw redirect({
      to: "/auth/sign-in",
    });
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
