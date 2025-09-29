import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/core/shared/components/ui/button";
import type { ProductDetail } from "@repo/core/entities/product";

interface Props {
  product: ProductDetail;
}

export function ProductHeaderSection({ product }: Props) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="text-muted-foreground">Detalles del producto</p>
      </div>
      <div className="space-x-2 items-center flex">
        <Button className="space-x-2">
          <PencilIcon />
          <span>Editar</span>
        </Button>
        <Button variant="destructive" className="space-x-2">
          <Trash2Icon />
          <span>Eliminar</span>
        </Button>
      </div>
    </header>
  );
}
