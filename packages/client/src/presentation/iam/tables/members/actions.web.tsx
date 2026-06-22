import type { MemberSummary } from "@fludge/client/application/iam/hooks/use-find-members";
import { Button } from "@fludge/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@fludge/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@fludge/ui/components/tooltip";
import { MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";

interface Props {
  row: MemberSummary;
}

export function MembersTableActions({ row: _row }: Props) {
  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(props) => <Button {...props} variant="ghost" size="icon" />}
        >
          <MoreVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <Tooltip>
              <TooltipTrigger
                render={(props) => (
                  <DropdownMenuItem
                    {...props}
                    disabled
                    className="pointer-events-auto data-disabled:cursor-not-allowed"
                  >
                    <PencilIcon />
                    Editar
                  </DropdownMenuItem>
                )}
              />
              <TooltipContent className="z-[60]">Próximamente</TooltipContent>
            </Tooltip>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Peligro</DropdownMenuLabel>
            <Tooltip>
              <TooltipTrigger
                render={(props) => (
                  <DropdownMenuItem
                    {...props}
                    disabled
                    variant="destructive"
                    className="pointer-events-auto data-disabled:cursor-not-allowed"
                  >
                    <TrashIcon />
                    Eliminar
                  </DropdownMenuItem>
                )}
              />
              <TooltipContent className="z-[60]">Próximamente</TooltipContent>
            </Tooltip>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}