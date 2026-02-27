import { createFileRoute } from "@tanstack/react-router";
import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { useFindAllTeams } from "@/modules/new-teams/application/hooks/use-teams-queries";
import { TeamsScreen } from "@/modules/new-teams/presentation/screens/teams.screen";

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
