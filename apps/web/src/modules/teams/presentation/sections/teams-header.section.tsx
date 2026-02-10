import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { CreateTeamDialog } from "../components/create-team-dialog";
import { useVerifiedSession } from "@/modules/auth/application/hooks/use-session";
import { useTeamsCollection } from "@/modules/shared/hooks/use-teams-collection";
import { count, useLiveSuspenseQuery } from "@tanstack/react-db";

export function TeamsHeaderSection() {
  const { data: session } = useVerifiedSession();
  const teamsCollection = useTeamsCollection();
  const { data } = useLiveSuspenseQuery((q) =>
    q.from({ teams: teamsCollection }).select(({ teams }) => ({
      total: count(teams.id),
    })),
  );

  const total = data.at(0)?.total || 0;

  return (
    <header>
      <Card className="flex flex-row justify-between items-start">
        <CardHeader className="flex-1">
          <CardTitle className="text-2xl">Listado de Equipos</CardTitle>
          <CardDescription>
            Los equipos permiten agrupar permisos y empleados.
          </CardDescription>
          <CardDescription>{total} equipos en tu organización.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTeamDialog
            activeOrganizationId={session.activeOrganizationId}
          />
        </CardContent>
      </Card>
    </header>
  );
}
