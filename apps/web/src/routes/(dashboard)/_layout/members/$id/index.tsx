import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageHeader, PageHeaderItem } from "@/components/page-header";
import { MemberDetailScreen } from "@/modules/iam/screens/member-detail.screen";
import { memberCollectionBuilder } from "@fludge/client/application/iam/collections/member.collection";
import { useFindOneMember } from "@fludge/client/application/iam/hooks/use-find-members";

export const Route = createFileRoute("/(dashboard)/_layout/members/$id/")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const memberCollection = memberCollectionBuilder(
      context.activeOrganization.id,
      context.queryClient,
      context.orpc,
    );

    return {
      memberCollection,
    };
  },
  loader: async ({ context, params }) => {
    const member = await context.memberCollection
      .toArrayWhenReady()
      .then((members) => members.find((m) => m.id === params.id));

    if (!member)
      throw redirect({
        to: "/members",
      });

    return {
      activeOrganization: context.activeOrganization,
    };
  },
});

function RouteComponent() {
  const { activeOrganization } = Route.useLoaderData();
  const { id } = Route.useParams();
  const { data: member } = useFindOneMember(activeOrganization.id, id);

  if (!member) return null;

  return (
    <>
      <PageHeader>
        <PageHeaderItem label="Miembros" to="/members" />
        <PageHeaderItem label={member.user.name} />
      </PageHeader>
      <MemberDetailScreen
        member={member}
        organizationId={activeOrganization.id}
      />
    </>
  );
}