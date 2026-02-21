import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { PlusIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { CreateTeam } from "../components/create-team";
import { Button } from "@/modules/shared/components/ui/button";
import { Skeleton } from "@/modules/shared/components/ui/skeleton";
import { useVerifiedSession } from "@/integrations/auth/context";
import { useTeamsQueries } from "@/modules/teams/application/hooks/use-teams-queries";

export function TeamsHeaderSection() {
  const session = useVerifiedSession();
  const { totalEmployees } = useTeamsQueries();
  const { data } = useLiveSuspenseQuery(() => totalEmployees());

  const total = data?.total || 0;

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
          <CreateTeam activeOrganizationId={session.activeOrganizationId} />
        </CardContent>
      </Card>
    </header>
  );
}

export function TeamsHeaderSectionSkeleton() {
  return (
    <header>
      <Card className="flex flex-row justify-between items-start">
        <CardHeader className="flex-1">
          <CardTitle className="text-2xl">Listado de Equipos</CardTitle>
          <CardDescription>
            Los equipos permiten agrupar permisos y empleados.
          </CardDescription>
          <CardDescription>
            <Skeleton className="w-52 h-4" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled>
            <PlusIcon />
            <span>Crear Equipo</span>
          </Button>
        </CardContent>
      </Card>
    </header>
  );
}
