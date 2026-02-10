import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";
import { eq, useLiveSuspenseQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$orgslug/teams/$teamid")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgslug, teamid } = Route.useParams();
  const teamsCollection = useTeamsCollection();
  const { data: teams } = useLiveSuspenseQuery(
    (q) =>
      q
        .from({ teams: teamsCollection })
        .where(({ teams }) => eq(teams.id, teamid))
        .limit(1)
        .orderBy(({ teams }) => teams.createdAt, "desc"),
    [teamid],
  );

  const team = teams.at(0);

  if (!team) return null;

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Team">
        <DashBoardHeader.Home />
        <DashBoardHeader.Teams />
        <DashBoardHeader.Team label={team.name} />
      </DashBoardHeader.Content>
    </>
  );
}
