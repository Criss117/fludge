import type { ProductSummary } from "@fludge/client/application/catalog/hooks/use-find-products";
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
  BanIcon,
} from "lucide-react";

interface Props {
  row: ProductSummary;
  canUpdate: boolean;
  canDelete: boolean;
  onUpdateClick: (product: ProductSummary) => void;
  onDeleteClick: (product: ProductSummary) => void;
  onActivateClick: (product: ProductSummary) => void;
  onDeactivateClick: (product: ProductSummary) => void;
  onDiscontinueClick: (product: ProductSummary) => void;
}

export function ProductsTableActions({
  row,
  canUpdate,
  canDelete,
  onUpdateClick,
  onDeleteClick,
  onActivateClick,
  onDeactivateClick,
  onDiscontinueClick,
}: Props) {
  if (!canUpdate && !canDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => <Button {...props} variant="ghost" size="icon" />}
      >
        <MoreVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {canUpdate && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onUpdateClick(row)}>
              <PencilIcon />
              Editar
            </DropdownMenuItem>
            {row.status === "active" ? (
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
            {row.status !== "discontinued" && (
              <DropdownMenuItem onClick={() => onDiscontinueClick(row)}>
                <BanIcon />
                Descontinuar
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        )}
        {canDelete && (
          <>
            {canUpdate && <DropdownMenuSeparator />}
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}