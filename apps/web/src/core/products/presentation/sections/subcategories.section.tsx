import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import type { CategorySummary } from "@repo/core/entities/category";
import { CategorySummaryTable } from "../components/categories-summary-table";
import { Button } from "@/core/shared/components/ui/button";
import { CreateCategoryDialog } from "../components/create-category-dialog";
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
import { useMutateCategories } from "../../application/hooks/use.mutate-categories";
import { useState } from "react";

interface Props {
  subcategories: CategorySummary[];
  parentId: string;
  businessId: string;
}

function DeleteSubCategoriesButton({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false);
  const { deleteMany } = useMutateCategories();
  const { table } = CategorySummaryTable.useCategorySummaryTable();

  const selectedCategories = table
    .getSelectedRowModel()
    .rows.flatMap((r) => r.original);

  const handleClick = () => {
    if (selectedCategories.length === 0) return;

    deleteMany.mutate(
      {
        businessId,
        categoriesIds: selectedCategories.map((c) => c.id),
      },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={selectedCategories.length === 0 || deleteMany.isPending}
        >
          Eliminar ({selectedCategories.length}) subcategorías
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar subcategorías</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar ({selectedCategories.length})
              subcategorías?
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={selectedCategories.length === 0 || deleteMany.isPending}
            onClick={handleClick}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SubcategoriesSection({
  subcategories,
  businessId,
  parentId,
}: Props) {
  return (
    <Card>
      <CategorySummaryTable.Root data={subcategories}>
        <CardHeader className="flex justify-between">
          <div>
            <CardTitle>Subcategorías</CardTitle>
            <CardDescription>
              Aquí se muestran todas las subcategorías de la categoría
            </CardDescription>
          </div>
          <div className="space-x-2">
            <DeleteSubCategoriesButton businessId={businessId} />
            <CreateCategoryDialog
              businessId={businessId}
              type="subcategory"
              parentId={parentId}
            />
          </div>
        </CardHeader>
        <CardContent>
          <CategorySummaryTable.Content>
            <CategorySummaryTable.Header />
            <CategorySummaryTable.Body />
          </CategorySummaryTable.Content>
        </CardContent>
      </CategorySummaryTable.Root>
    </Card>
  );
}
