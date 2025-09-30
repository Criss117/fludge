import { Button } from "@/core/shared/components/ui/button";
import { CategorySummaryTable } from "@/core/products/presentation/components/categories-summary-table";
import { CreateCategoryDialog } from "@/core/products/presentation/components/create-category-dialog";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";
import { useMutateCategories } from "@/core/products/application/hooks/use.mutate-categories";
import { Trash2Icon } from "lucide-react";

interface Props {
  totalCategories: number;
  businessId: string;
}

export function CategoriesHeader({ totalCategories, businessId }: Props) {
  const { table } = CategorySummaryTable.useCategorySummaryTable();
  const { userHasPermissions } = usePermissions();
  const { deleteMany } = useMutateCategories();

  const selectedRows = table.getSelectedRowModel().rows.length;

  const userCanDeleteCategories = userHasPermissions("categories:delete");
  const userCanCreateCategories = userHasPermissions("categories:create");

  const deleteManyCategories = () => {
    const categoriesIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    if (!categoriesIds.length) return;

    deleteMany.mutate({ categoriesIds, businessId });
  };

  return (
    <header className="flex justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          Listado de Categorias ({totalCategories}
          {selectedRows > 0 && `/${selectedRows}`})
        </h2>
        <p className="text-muted-foreground text-sm">
          Administra las categorías de tus productos
        </p>
      </div>
      <div className="space-x-2">
        {userCanDeleteCategories && (
          <Button
            variant="destructive"
            disabled={selectedRows === 0 || deleteMany.isPending}
            onClick={deleteManyCategories}
          >
            <Trash2Icon />
            Eliminar
          </Button>
        )}
        {userCanCreateCategories && (
          <CreateCategoryDialog businessId={businessId} />
        )}
      </div>
    </header>
  );
}
