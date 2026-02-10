import { Link } from "@tanstack/react-router";
import { MoreVerticalIcon, PencilIcon, TrashIcon, Users } from "lucide-react";
import { Button } from "@/modules/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/modules/shared/components/ui/dropdown-menu";
import type { Team } from "@/modules/teams/application/collections/teams.collection";
import { RemoveTeam } from "./remove";
import { UpdateTeamDialog } from "../update-team-dialog";

interface Props {
  orgSlug: string;
  team: Team;
}

export function TeamsTableActions({ orgSlug, team }: Props) {
  const { selectTeam } = UpdateTeamDialog.useUpdateTeam();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => <Button {...props} variant="ghost" size="icon" />}
      >
        <MoreVerticalIcon />
        <span className="sr-only">Acciones para {team.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-2"
            render={(props) => (
              <Link
                to="/dashboard/$orgslug/teams/$teamid"
                params={{
                  teamid: team.id,
                  orgslug: orgSlug,
                }}
                {...props}
              />
            )}
          >
            <Users className="h-4 w-4" />
            Ver mas
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={() => selectTeam(team)}>
            <PencilIcon className="h-4 w-4" />
            Editar equipo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <RemoveTeam team={team} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
