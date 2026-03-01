import { createFileRoute } from "@tanstack/react-router";

import { DashBoardHeader } from "@shared/components/dashboard-header";

import { useFindAllTeams } from "@teams/application/hooks/use-teams-queries";
import { TeamsScreen } from "@teams/presentation/screens/teams.screen";

export const Route = createFileRoute("/dashboard/$orgslug/teams/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgslug } = Route.useParams();
  const teams = useFindAllTeams();

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Teams">
        <DashBoardHeader.Home />
        <DashBoardHeader.Teams />
      </DashBoardHeader.Content>
      <TeamsScreen teams={teams} />
    </>
  );
}
