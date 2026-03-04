import { MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { Button } from "@shared/components/ui/button";

import { useUpdateProduct } from "@inventory/presentation/components/update-product";
import { useMutateProducts } from "@inventory/application/hooks/use-mutate-products";
import type { Product } from "@inventory/application/collections/products.collection";

interface Props {
  product: Product;
}

export function ProductsTableActions({ product }: Props) {
  const { selectProduct } = useUpdateProduct();
  const { remove } = useMutateProducts();

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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="gap-2"
            onClick={() => remove.mutate([product.id])}
          >
            <TrashIcon className="h-4 w-4" />
            Eliminar equipo
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
