import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";

import type { Product } from "@inventory/application/collections/products.collection";
import { MoreVerticalIcon, PencilIcon } from "lucide-react";
import { Button } from "@/modules/shared/components/ui/button";
import { useUpdateProduct } from "../update-product";

interface Props {
  product: Product;
}

export function ProductsTableActions({ product }: Props) {
  const { selectProduct } = useUpdateProduct();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(props) => <Button {...props} variant="ghost" size="icon" />}
      >
        <MoreVerticalIcon />
        <span className="sr-only">Acciones para {product.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => selectProduct(product)}
          >
            <PencilIcon className="h-4 w-4" />
            Editar equipo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
