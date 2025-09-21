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
import { useState } from "react";

interface Props {
  businessId: string;
}

export function CreateCategoryDialog({ businessId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          Crear Categoría
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CategoryForm.Root
          businessId={businessId}
          actions={{
            onSuccess: () => setOpen(false),
          }}
        >
          <DialogHeader>
            <DialogTitle>Crear Categoría</DialogTitle>
            <DialogDescription>
              Completa los datos para crear una categoría
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
