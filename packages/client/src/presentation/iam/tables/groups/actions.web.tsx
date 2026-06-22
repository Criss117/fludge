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
  onDeleteClick: (group: GroupSummary) => void;
  onActivateClick: (group: GroupSummary) => void;
  onDeactivateClick: (group: GroupSummary) => void;
}

export function GroupsTableActions({
  row,
  onUpdateClick,
  onDeleteClick,
  onActivateClick,
  onDeactivateClick,
}: Props) {
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
            <DropdownMenuItem onClick={() => onDeactivateClick(row)}>
              <EyeOffIcon />
              Desactivar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onActivateClick(row)}>
              <EyeIcon />
              Activar
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Peligro</DropdownMenuLabel>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDeleteClick(row)}
          >
            <TrashIcon />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
