import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import type { Team } from "@/modules/teams/application/collections/teams.collection";
import { UpdateTeamDialog } from "../components/update-team-dialog";
import { Button } from "@/modules/shared/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Separator } from "@/modules/shared/components/ui/separator";
import { Skeleton } from "@/modules/shared/components/ui/skeleton";

interface Props {
  team: Team;
}

function UpdateTeamTrigger({ team }: Props) {
  const { selectTeam } = UpdateTeamDialog.useUpdateTeam();
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
            <UpdateTeamDialog.Root>
              <UpdateTeamTrigger team={team} />
              <UpdateTeamDialog.FormDialog />
            </UpdateTeamDialog.Root>
          </CardContent>
        </div>
        <CardFooter className="flex flex-row items-center">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Empleados Asignados</p>
            <p>{team.employees.length}</p>
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
            <UpdateTeamDialog.Root>
              <Button variant="outline" size="sm" disabled>
                <PlusIcon />
                Modificar
              </Button>
              <UpdateTeamDialog.FormDialog />
            </UpdateTeamDialog.Root>
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
