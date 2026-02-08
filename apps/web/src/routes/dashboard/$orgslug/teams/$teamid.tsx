import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$orgslug/teams/$teamid")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgslug } = Route.useParams();

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Team">
        <DashBoardHeader.Home />
        <DashBoardHeader.Teams />
        <DashBoardHeader.Team label="Administradores" />
      </DashBoardHeader.Content>
    </>
  );
}
