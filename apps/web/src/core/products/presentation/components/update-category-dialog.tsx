import { useState } from "react";
import { PencilIcon } from "lucide-react";
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
import type { CreateCategoryDto } from "@repo/ui/products/dtos/create-category.dto";

interface Props {
  businessId: string;
  category: CreateCategoryDto;
}

export function UpdateCategoryDialog({ businessId, category }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PencilIcon />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CategoryForm.Root
          businessId={businessId}
          actions={{
            onSuccess: () => setOpen(false),
          }}
          defaultValues={{
            name: category.name,
            description: category.description,
          }}
        >
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Completa los datos para editar la categoría
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
