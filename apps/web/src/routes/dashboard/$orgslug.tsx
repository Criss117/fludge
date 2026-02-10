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
  beforeLoad: async ({ context }) => {
    const { data: session, error } = await tryCatch(
      context.queryClient.fetchQuery(
        context.orpc.auth.getSession.queryOptions(),
      ),
    );

    if (!session || error)
      throw redirect({
        to: "/",
      });

    return {
      session,
    };
  },
  loader: async ({ context, params }) => {
    const orgs = context.session.organizations;

    if (!orgs?.length) throw redirect({ to: "/register-organization" });

    const selectedOrg = orgs.find((org) => org.slug === params.orgslug);

    if (!selectedOrg) throw redirect({ to: "/select-organization" });

    if (selectedOrg.id === context.session.activeOrganizationId) return;

    const { error } = await tryCatch(
      authClient.organization.setActive({
        organizationId: selectedOrg.id,
        organizationSlug: selectedOrg.slug,
        fetchOptions: {
          onSuccess: () => {
            context.queryClient.invalidateQueries(
              context.orpc.auth.getSession.queryOptions(),
            );
          },
        },
      }),
    );

    if (error) throw redirect({ to: "/" });

    context.session.activeOrganizationId = selectedOrg.id;
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
