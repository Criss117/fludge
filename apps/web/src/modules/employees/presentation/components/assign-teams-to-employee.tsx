import { toast } from "sonner";
import { useState } from "react";
import { UserPlusIcon } from "lucide-react";
import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { Button } from "@/modules/shared/components/ui/button";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/shared/components/ui/dialog";
import { SearchInput } from "@/modules/shared/components/search-input";
import { useMutateEmployees } from "../../application/hooks/use-mutate-employees";
import { useTeamsQueries } from "@/modules/teams/application/hooks/use-teams-queries";
import type { Team } from "@/modules/teams/application/collections/teams.collection";

interface Props {
  userId: string;
}

export function AssignTeamsToEmployee({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { assignTeams } = useMutateEmployees();
  const { findManyTeams } = useTeamsQueries();

  const { data: teams } = useLiveSuspenseQuery(
    () =>
      findManyTeams({
        filterBy: {
          employee: {
            type: "outside",
            userId,
          },
          name: searchQuery,
        },
      }),
    [searchQuery],
  );

  const selectTeam = (team: Team) => {
    setSelectedTeamIds((prev) => {
      if (prev.includes(team.id)) {
        return prev.filter((id) => id !== team.id);
      }
      return [...prev, team.id];
    });
  };

  const handleAssignEmployees = async () => {
    const loadingToastId = toast.loading("Asignando empleados al equipo", {
      position: "top-center",
    });
    assignTeams.mutate(
      {
        userId,
        teamIds: selectedTeamIds,
      },
      {
        onSuccess: () => {
          toast.success("Empleados asignados exitosamente", {
            position: "top-center",
          });
          setSelectedTeamIds([]);
          setSearchQuery("");
          setOpen(false);
        },
        onError: () => {
          toast.error("Error asignando empleados", {
            position: "top-center",
          });
        },
        onSettled: () => {
          toast.dismiss(loadingToastId);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setSelectedTeamIds([]);
          setSearchQuery("");
        }
        setOpen(v);
      }}
    >
      <DialogTrigger render={(props) => <Button {...props} />}>
        <UserPlusIcon />
        <span>Asignar</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar equipos</DialogTitle>
          <DialogDescription>
            Busca y selecciona equipos para agregar a este equipo.
          </DialogDescription>
        </DialogHeader>
        <SearchInput
          placeholder="Buscar Empleados"
          value={searchQuery}
          onChange={setSearchQuery}
          disabled={assignTeams.isPending}
        />
        {teams.length === 0 && (
          <p className="text-sm text-muted-foreground text-center">
            No se encontraron equipos o ya están asignados a este equipo.
          </p>
        )}
        {teams.map((t) => (
          <Button
            key={t.id}
            variant="outline"
            className="py-8 px-4 flex justify-between"
            onClick={() => selectTeam(t)}
          >
            <div className="flex items-center gap-x-2">
              <div className="flex items-start flex-col">
                <p className="text-sm font-medium">{t.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <Checkbox
                checked={selectedTeamIds.includes(t.id)}
                onClick={() => selectTeam(t)}
              />
            </div>
          </Button>
        ))}
        <DialogFooter>
          <DialogClose
            render={(props) => <Button {...props} variant="outline" />}
          >
            Cancelar
          </DialogClose>
          <Button
            disabled={selectedTeamIds.length === 0 || assignTeams.isPending}
            onClick={handleAssignEmployees}
          >
            Asignar ({selectedTeamIds.length}) Equipos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
