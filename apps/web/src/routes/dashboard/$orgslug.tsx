import { authClient } from "@/integrations/auth";
import { AppSidebar } from "@/modules/shared/components/app-sidebar";
import { LoadingScreen } from "@/modules/shared/components/loading-screen";
import {
  SidebarInset,
  SidebarProvider,
} from "@/modules/shared/components/ui/sidebar";
import { tryCatch } from "@fludge/utils/try-catch";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$orgslug")({
  component: RouteComponent,
  beforeLoad: async ({ context, params }) => {
    const session = context.auth.session;

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
      authClient.organization.setActive({
        organizationId: selectedOrganization.id,
        organizationSlug: selectedOrganization.slug,
        fetchOptions: {
          onSuccess: () => {
            context.auth.refetchSession();
          },
        },
      }),
    );

    if (error) throw redirect({ to: "/" });

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
