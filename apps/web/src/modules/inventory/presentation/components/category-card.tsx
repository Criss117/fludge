import { PencilLine, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Checkbox } from "@shared/components/ui/checkbox";
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
} from "@shared/components/ui/alert-dialog";

import type { Category } from "@inventory/application/collections/categories.collection";
import { useMutateCategories } from "@inventory/application/hooks/use-mutate-categories";
import { UpdateCategory } from "./update-category";

interface Props {
  category: Category;
}

function RemoveCategory({ category }: Props) {
  const { remove } = useMutateCategories();

  const handleDelete = () => {
    const toastLoadingId = toast.loading("Eliminando categoria...", {
      position: "top-center",
    });

    remove.mutate(
      {
        ids: [category.id],
      },
      {
        onSettled: () => toast.dismiss(toastLoadingId),
        onError: () =>
          toast.error("Error al eliminar la categoria.", {
            position: "top-center",
          }),
        onSuccess: () => {
          toast.dismiss(toastLoadingId);
          toast.success("Categoria eliminada exitosamente!", {
            position: "top-center",
          });
        },
      },
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={(props) => (
          <Button variant="secondary" size="icon" {...props} />
        )}
      >
        <TrashIcon className="text-destructive" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar {category.name}</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={remove.isPending}
          >
            Eliminar
          </AlertDialogAction>
          <AlertDialogCancel
            render={(props) => <Button variant="outline" {...props} />}
          >
            Cancelar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CategoryCard({ category }: Props) {
  const { selectCategory } = UpdateCategory.useUpdateCategory();

  const handleSelect = () => {
    selectCategory(category);
  };

  return (
    <Card className="flex flex-row py-3 items-center">
      <CardHeader className="flex flex-row items-center flex-1 gap-x-2">
        <Checkbox />
        <div>
          <CardTitle>{category.name}</CardTitle>
          <CardDescription>{category.description || "-"}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="secondary" size="icon" onClick={handleSelect}>
          <PencilLine />
        </Button>
        <RemoveCategory category={category} />
      </CardContent>
    </Card>
  );
}
