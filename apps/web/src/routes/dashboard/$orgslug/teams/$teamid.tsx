import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { useFindTeamById } from "@/modules/new-teams/application/hooks/use-teams-queries";
import {
  TeamScreen,
  TeamScreenSkeleton,
} from "@/modules/new-teams/presentation/screens/team.screen";
import { teamsCollectionBuilder } from "@/modules/new-teams/application/collections/teams.collections";

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
  const team = useFindTeamById(teamid);

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
