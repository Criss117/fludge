import { PlusIcon } from "lucide-react";
import { Button } from "@fludge/ui/components/button";

/**
 * Static placeholder button — no sheet, no action.
 * Real create flow will be wired in a future change.
 */
export function CreateCategory() {
  return (
    <Button>
      <PlusIcon />
      <span>Nueva Categoría</span>
    </Button>
  );
}