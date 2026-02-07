import { authClient } from "@/integrations/auth";
import { AppSidebar } from "@/modules/shared/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/modules/shared/components/ui/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$orgslug")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery(
      context.orpc.auth.getSession.queryOptions(),
    );

    if (!session)
      throw redirect({
        to: "/",
      });

    return {
      ...session,
    };
  },
  loader: async ({ context, params }) => {
    const orgs = context.organizations;

    if (!orgs?.length) throw redirect({ to: "/register-organization" });

    const selectedOrg = orgs.find((org) => org.slug === params.orgslug);

    if (!selectedOrg) throw redirect({ to: "/select-organization" });

    const isSameActiveOrg =
      selectedOrg.id === context.session.activeOrganizationId;

    if (!isSameActiveOrg) {
      await authClient.organization.setActive({
        organizationId: selectedOrg.id,
        organizationSlug: selectedOrg.slug,
        fetchOptions: {
          onSuccess: () => {
            context.queryClient.invalidateQueries(
              context.orpc.auth.getSession.queryOptions(),
            );
          },
        },
      });
    }
  },
  pendingComponent: () => <div>Loading...</div>,
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
