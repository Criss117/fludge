import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";
import { teamsCollectionBuilder } from "@/modules/teams/application/collections/teams.collection";
import {
  TeamScreen,
  TeamScreenSkeleton,
} from "@/modules/teams/presentation/screens/team.screen";
import { eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { createFileRoute, redirect } from "@tanstack/react-router";

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
  const teamsCollection = useTeamsCollection();
  const {
    data: [team],
  } = useLiveSuspenseQuery((q) =>
    q
      .from({ teams: teamsCollection })
      .where(({ teams }) => eq(teams.id, teamid)),
  );

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Team">
        <DashBoardHeader.Home />
        <DashBoardHeader.Teams />
        <DashBoardHeader.Team label={team.name} />
      </DashBoardHeader.Content>
      <TeamScreen team={team} />
    </>
  );
}
