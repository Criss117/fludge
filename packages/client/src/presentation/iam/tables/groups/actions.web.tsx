import type { GroupSummary } from "@fludge/client/application/iam/hooks/use-find-groups";
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
  EyeIcon,
  EyeOffIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";

interface Props {
  row: GroupSummary;
  onUpdateClick: (group: GroupSummary) => void;
}

export function GroupsTableActions({ row, onUpdateClick }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => <Button {...props} variant="ghost" size="icon" />}
      >
        <MoreVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onUpdateClick(row)}>
            <PencilIcon />
            Editar
          </DropdownMenuItem>
          {!row.deletedAt ? (
            <DropdownMenuItem closeOnClick={false}>
              <EyeOffIcon />
              Desactivar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem closeOnClick={false}>
              <EyeIcon />
              Activar
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Peligro</DropdownMenuLabel>
          <DropdownMenuItem closeOnClick={false} variant="destructive">
            <TrashIcon />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
