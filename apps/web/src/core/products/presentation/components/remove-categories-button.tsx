import { Trash2Icon } from "lucide-react";
import { Button } from "@/core/shared/components/ui/button";
import { useMutateCategories } from "@/core/products/application/hooks/use.mutate-categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/core/shared/components/ui/alert-dialog";

interface Props {
  variant?: "single" | "multiple";
  type?: "category" | "subcategory";
  categoriesIds: string[];
  businessId: string;
}

export function RemoveCategoriesButton({
  variant = "single",
  type = "category",
  categoriesIds,
  businessId,
}: Props) {
  const { deleteMany } = useMutateCategories();

  const handleDelete = () => {
    deleteMany.mutate({
      categoriesIds,
      businessId,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={deleteMany.isPending || categoriesIds.length === 0}
        >
          {variant === "single" && (
            <>
              <Trash2Icon /> Eliminar
            </>
          )}
          {variant === "multiple" &&
            `Eliminar (${categoriesIds.length}) categorías`}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Eliminar {type === "category" ? "categoría" : "subcategoría"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar ({categoriesIds.length}){" "}
              {type === "category" ? "categorías" : "subcategorías"}?
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={categoriesIds.length === 0 || deleteMany.isPending}
            onClick={handleDelete}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
