import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageHeader, PageHeaderItem } from "@/components/page-header";
import { GroupScreen } from "@/modules/iam/screens/group.screen";
import { groupCollectionBuilder } from "@fludge/client/application/iam/collections/group.collection";
import { useFindOneGroup } from "@fludge/client/application/iam/hooks/use-find-groups";

export const Route = createFileRoute("/(dashboard)/_layout/groups/$slug/")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const groupCollection = groupCollectionBuilder(
      context.activeOrganization.id,
      context.queryClient,
      context.orpc,
    );

    return {
      groupCollection,
    };
  },
  loader: async ({ context, params }) => {
    const group = await context.groupCollection
      .toArrayWhenReady()
      .then((group) =>
        group.find(
          (g) =>
            g.slug === params.slug &&
            g.organizationId === context.activeOrganization.id,
        ),
      );

    if (!group)
      throw redirect({
        to: "/groups",
      });

    return {
      activeOrganization: context.activeOrganization,
    };
  },
});

function RouteComponent() {
  const { activeOrganization } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { data: group } = useFindOneGroup(activeOrganization.id, slug);

  if (!group) return null;

  return (
    <>
      <PageHeader>
        <PageHeaderItem label="Grupos" to="/groups" />
        <PageHeaderItem label={group.name} />
      </PageHeader>
      <GroupScreen group={group} organizationId={activeOrganization.id} />
    </>
  );
}
