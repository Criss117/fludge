import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { tryCatch } from "@fludge/utils/try-catch";

import { AppSidebar } from "@shared/components/app-sidebar";
import { LoadingScreen } from "@shared/components/loading-screen";
import { SidebarInset, SidebarProvider } from "@shared/components/ui/sidebar";
import { orpc } from "@/integrations/orpc";

export const Route = createFileRoute("/dashboard/$orgslug")({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const session = context.auth.session;

    console.log({ session });

    if (!session)
      throw redirect({
        to: "/",
      });

    if (!session.organizations?.length)
      throw redirect({ to: "/register-organization" });

    const selectedOrganization = session.organizations.find(
      (org) => org.slug === params.orgslug,
    );

    if (!selectedOrganization) throw redirect({ to: "/select-organization" });

    if (selectedOrganization.id === session.activeOrganizationId)
      return {
        selectedOrganization,
      };

    const { error } = await tryCatch(
      orpc.auth.setActiveOrganization.call({
        organizationId: selectedOrganization.id,
      }),
    );

    if (error) throw redirect({ to: "/" });

    await context.auth.refetchSession();

    return {
      selectedOrganization,
    };
  },
  pendingComponent: () => <LoadingScreen messages="Verificando Credenciales" />,
});

function RouteComponent() {
  const { orgslug } = Route.useParams();

  return (
    <SidebarProvider>
      <AppSidebar orgSlug={orgslug} />
      <SidebarInset>
        <main>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
