import { PageHeader, PageHeaderItem } from "@/components/page-header";
import { MemberScreen } from "@/modules/iam/screens/member.screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(dashboard)/_layout/members/")({
  component: RouteComponent,
  loader: ({ context }) => {
    return context.activeOrganization;
  },
});

function RouteComponent() {
  const activeOrganizaion = Route.useLoaderData();

  return (
    <main>
      <PageHeader>
        <PageHeaderItem label="Miembros" />
      </PageHeader>
      <MemberScreen organizationId={activeOrganizaion.id} />
    </main>
  );
}
