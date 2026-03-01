import { createFileRoute } from "@tanstack/react-router";

import { DashBoardHeader } from "@shared/components/dashboard-header";

export const Route = createFileRoute("/dashboard/$orgslug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { orgslug } = Route.useParams();

  return (
    <>
      <DashBoardHeader.Content orgSlug={orgslug}>
        <DashBoardHeader.Home />
      </DashBoardHeader.Content>
    </>
  );
}
