import { useState } from "react";
import { Button } from "@/core/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/shared/components/ui/dialog";
import { CategoryForm } from "./category-form";

interface Props {
  businessId: string;
  type?: "category" | "subcategory";
  parentId?: string;
}

export function CreateCategoryDialog({
  businessId,
  type = "category",
  parentId,
}: Props) {
  const [open, setOpen] = useState(false);

  if (type === "subcategory" && !parentId) {
    throw new Error("parentId is required");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="border-2" variant="secondary">
          {type === "category" ? "Crear Categoría" : "Crear Subcategoría"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CategoryForm.Root
          businessId={businessId}
          actions={{
            onSuccess: () => setOpen(false),
          }}
          type={type}
          parentId={parentId}
        >
          <DialogHeader>
            <DialogTitle>
              {type === "category" ? "Crear Categoría" : "Crear Subcategoría"}
            </DialogTitle>
            <DialogDescription>
              Completa los datos para crear una{" "}
              {type === "category" ? "categoría" : "subcategoría"}
            </DialogDescription>
          </DialogHeader>

          <CategoryForm.Content>
            <CategoryForm.RootErrorMessage />
            <fieldset className="space-y-4">
              <CategoryForm.Name />
              <CategoryForm.Description />
            </fieldset>
          </CategoryForm.Content>

          <DialogFooter className="flex sm:justify-between">
            <DialogClose asChild>
              <Button variant="secondary">Cancelar</Button>
            </DialogClose>
            <CategoryForm.Submit />
          </DialogFooter>
        </CategoryForm.Root>
      </DialogContent>
    </Dialog>
  );
}
