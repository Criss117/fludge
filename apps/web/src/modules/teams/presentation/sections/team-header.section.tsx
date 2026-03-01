import { PlusIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Separator } from "@shared/components/ui/separator";
import { Skeleton } from "@shared/components/ui/skeleton";

import { UpdateTeam } from "@teams/presentation/components/update-team";
import type { TeamWithMembers } from "@teams/application/hooks/use-teams-queries";

interface Props {
  team: TeamWithMembers;
}

function UpdateTeamTrigger({ team }: Props) {
  const { selectTeam } = UpdateTeam.useUpdateTeam();
  return (
    <Button variant="outline" size="sm" onClick={() => selectTeam(team)}>
      <PlusIcon />
      Modificar
    </Button>
  );
}

export function TeamHeaderSection({ team }: Props) {
  return (
    <header>
      <Card>
        <div className="flex flex-row justify-between">
          <CardHeader className="flex-1">
            <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {team.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateTeam.Root>
              <UpdateTeamTrigger team={team} />
              <UpdateTeam.FormDialog />
            </UpdateTeam.Root>
          </CardContent>
        </div>
        <CardFooter className="flex flex-row items-center">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Empleados Asignados</p>
            <p>{team.members.length}</p>
          </div>

          <Separator orientation="vertical" className="mx-4" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Creado el</p>
            <p>
              {team.createdAt.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <Separator orientation="vertical" className="mx-4" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Última actualización
            </p>
            <p>
              {team.updatedAt?.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </CardFooter>
      </Card>
    </header>
  );
}

export function TeamHeaderSkeleton() {
  return (
    <header>
      <Card>
        <div className="flex flex-row justify-between">
          <CardHeader className="flex-1">
            <CardTitle className="text-xl font-bold">
              <Skeleton className="h-6 w-1/3" />
            </CardTitle>
            <CardDescription className="line-clamp-2">
              <Skeleton />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateTeam.Root>
              <Button variant="outline" size="sm" disabled>
                <PlusIcon />
                Modificar
              </Button>
              <UpdateTeam.FormDialog />
            </UpdateTeam.Root>
          </CardContent>
        </div>
        <CardFooter className="flex flex-row items-center">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Empleados Asignados</p>
            <Skeleton className="h-5 w-full" />
          </div>

          <Separator orientation="vertical" className="mx-4" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Creado el</p>

            <Skeleton className="h-5 w-full" />
          </div>

          <Separator orientation="vertical" className="mx-4" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Última actualización
            </p>
            <Skeleton className="h-5 w-full" />
          </div>
        </CardFooter>
      </Card>
    </header>
  );
}
