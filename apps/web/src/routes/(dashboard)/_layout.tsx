import { Outlet } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@fludge/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/(dashboard)/_layout")({
  component: RouteComponent,
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
