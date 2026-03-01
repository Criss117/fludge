import { Link } from "@tanstack/react-router";
import { MoreVerticalIcon, PencilIcon, Users } from "lucide-react";

import { Button } from "@shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";

import { UpdateTeam } from "@teams/presentation/components/update-team";
import { RemoveTeam } from "@teams/presentation/components/teams-table/remove";
import type { TeamWithMembers } from "@teams/application/hooks/use-teams-queries";

interface Props {
  orgSlug: string;
  team: TeamWithMembers;
}

export function TeamsTableActions({ orgSlug, team }: Props) {
  const { selectTeam } = UpdateTeam.useUpdateTeam();

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
