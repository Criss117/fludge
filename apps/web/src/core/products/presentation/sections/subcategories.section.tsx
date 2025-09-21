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

interface Props {
  subcategories: CategorySummary[];
}

export function SubcategoriesSection({ subcategories }: Props) {
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
          <Button variant="destructive" className="rounded-full">
            Eliminar subcategorías
          </Button>
          <Button variant="secondary" className="rounded-full border-2">
            Agreagar subcategoría
          </Button>
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
