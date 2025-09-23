import { Button } from "@/core/shared/components/ui/button";
import { CategorySummaryTable } from "../components/categories-summary-table";
import { CreateCategoryDialog } from "../components/create-category-dialog";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";

interface Props {
  totalCategories: number;
  businessId: string;
}

export function CategoriesHeader({ totalCategories, businessId }: Props) {
  const { table } = CategorySummaryTable.useCategorySummaryTable();
  const { userHasPermissions } = usePermissions();

  const selectedRows = table.getSelectedRowModel().rows.length;

  const userCanDeleteCategories = userHasPermissions("categories:delete");

  return (
    <header className="flex justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          Listado de Categorias ({totalCategories}
          {selectedRows > 0 && `/${selectedRows}`})
        </h2>
        <p className="text-muted-foreground text-sm">
          Los grupos permiten organizar los permisos de los empleados.
        </p>
      </div>
      <div className="space-x-2">
        <Button
          variant="destructive"
          disabled={selectedRows === 0 || !userCanDeleteCategories}
        >
          Eliminar
        </Button>
        <CreateCategoryDialog businessId={businessId} />
      </div>
    </header>
  );
}
