import { PlusIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Skeleton } from "@shared/components/ui/skeleton";

import { CreateTeam } from "@teams/presentation/components/create-team";

interface Props {
  totalTeams: number;
}

export function TeamsHeaderSection({ totalTeams }: Props) {
  return (
    <header>
      <Card className="flex flex-row justify-between items-start">
        <CardHeader className="flex-1">
          <CardTitle className="text-2xl">Listado de Equipos</CardTitle>
          <CardDescription>
            Los equipos permiten agrupar permisos y empleados.
          </CardDescription>
          <CardDescription>
            {totalTeams} equipos en tu organización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTeam />
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
