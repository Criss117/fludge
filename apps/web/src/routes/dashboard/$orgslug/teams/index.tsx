import { createFileRoute } from "@tanstack/react-router";
import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { teamsCollection } from "@/modules/teams/application/collections/teams.collection";
import { cn } from "@/modules/shared/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/integrations/orpc";
import { CreateTeamDialog } from "@/modules/teams/presentation/components/create-team-dialog";

export const Route = createFileRoute("/dashboard/$orgslug/teams/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgslug } = Route.useParams();
  const { data } = useSuspenseQuery(orpc.auth.getSession.queryOptions());

  const { data: teams } = useLiveQuery(
    (q) =>
      q
        .from({ teams: teamsCollection })
        .where(({ teams }) =>
          eq(teams.organizationId, data?.session.activeOrganizationId),
        )
        .orderBy(({ teams }) => teams.name, "asc"),
    [data?.session.activeOrganizationId],
  );

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Teams">
        <DashBoardHeader.Home />
        <DashBoardHeader.Teams />
      </DashBoardHeader.Content>
      <div>
        {teams?.map((team) => (
          <div
            key={team.id}
            className={cn(team.isPending ? "text-red-500" : "text-green-500")}
          >
            {team.name}
          </div>
        ))}
      </div>
      <CreateTeamDialog
        activeOrganizationId={data?.session.activeOrganizationId!}
      />
    </>
  );
}
