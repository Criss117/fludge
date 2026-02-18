import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { teamsCollectionBuilder } from "@/modules/teams/application/collections/teams.collection";
import {
  TeamScreen,
  TeamScreenSkeleton,
} from "@/modules/teams/presentation/screens/team.screen";
import { useTeamsQueries } from "@/modules/teams/application/hooks/use-teams-queries";

export const Route = createFileRoute("/dashboard/$orgslug/teams/$teamid")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const teamsCollection = teamsCollectionBuilder(
      context.selectedOrganization.id,
    );

    await teamsCollection.preload();

    const team = Array.from(teamsCollection.entries()).find(
      ([_, t]) => t.id === params.teamid,
    );

    if (!team)
      throw redirect({
        to: "/dashboard/$orgslug/teams",
        params: { orgslug: params.orgslug },
      });
  },
  pendingComponent: () => (
    <>
      <DashBoardHeader.Content orgSlug="..." currentPath="Team">
        <DashBoardHeader.Home />
        <DashBoardHeader.Teams />
        <DashBoardHeader.Team label="..." />
      </DashBoardHeader.Content>
      <TeamScreenSkeleton />
    </>
  ),
});

function RouteComponent() {
  const { orgslug, teamid } = Route.useParams();
  const { findOneTeam } = useTeamsQueries();

  const { data } = useLiveSuspenseQuery(
    () =>
      findOneTeam({
        filterBy: { id: teamid },
      }),
    [teamid],
  );

  if (!data) return null;

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Team">
        <DashBoardHeader.Home />
        <DashBoardHeader.Teams />
        <DashBoardHeader.Team label={data.name} />
      </DashBoardHeader.Content>
      <TeamScreen team={data} orgSlug={orgslug} />
    </>
  );
}
