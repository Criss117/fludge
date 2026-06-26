import { Button } from "@fludge/ui/components/button";
import { PlusIcon } from "lucide-react";

interface Props {
  organizationId: string;
}

export function CreateProduct({ organizationId }: Props) {
  void organizationId;

  return (
    <Button onClick={() => {}}>
      <PlusIcon />
      <span>Nuevo Producto</span>
    </Button>
  );
}