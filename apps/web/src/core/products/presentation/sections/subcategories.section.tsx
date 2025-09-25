import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import type { CategorySummary } from "@repo/core/entities/category";
import { CategorySummaryTable } from "../components/categories-summary-table";
import { CreateCategoryDialog } from "../components/create-category-dialog";
import { RemoveCategoriesButton } from "../components/remove-categories-button";

interface Props {
  subcategories: CategorySummary[];
  parentId: string;
  businessId: string;
}

function DeleteSubCategoriesButton({ businessId }: { businessId: string }) {
  const { table } = CategorySummaryTable.useCategorySummaryTable();

  const selectedIds = table
    .getSelectedRowModel()
    .rows.flatMap((r) => r.original.id);

  return (
    <RemoveCategoriesButton
      categoriesIds={selectedIds}
      businessId={businessId}
      type="subcategory"
      variant="multiple"
    />
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
