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

interface Props {
  subcategories: CategorySummary[];
  parentId: string;
  businessId: string;
}

export function SubcategoriesSection({
  subcategories,
  businessId,
  parentId,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Subcategorías</CardTitle>
          <CardDescription>
            Aquí se muestran todas las subcategorías de la categoría
          </CardDescription>
        </div>
        <div className="space-x-2">
          <Button variant="destructive" disabled>
            Eliminar subcategorías
          </Button>
          <CreateCategoryDialog
            businessId={businessId}
            type="subcategory"
            parentId={parentId}
          />
        </div>
      </CardHeader>
      <CardContent>
        <CategorySummaryTable.Root data={subcategories}>
          <CategorySummaryTable.Content>
            <CategorySummaryTable.Header />
            <CategorySummaryTable.Body />
          </CategorySummaryTable.Content>
        </CategorySummaryTable.Root>
      </CardContent>
    </Card>
  );
}
