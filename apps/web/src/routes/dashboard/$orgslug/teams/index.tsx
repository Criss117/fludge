import { createFileRoute } from "@tanstack/react-router";
import { DashBoardHeader } from "@/modules/shared/components/dashboard-header";

export const Route = createFileRoute("/dashboard/$orgslug/teams/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgslug } = Route.useParams();

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug} currentPath="Teams">
        <DashBoardHeader.Home />
        <DashBoardHeader.Teams />
      </DashBoardHeader.Content>
    </>
  );
}
