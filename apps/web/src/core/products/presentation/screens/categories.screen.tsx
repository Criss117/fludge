import { Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import { useFindManyCategories } from "../../application/hooks/use.find-many-categories";
import { CategorySummaryTable } from "../components/categories-summary-table";
import { PageHeader } from "@/core/shared/components/page-header";
import { Button } from "@/core/shared/components/ui/button";

interface Props {
  businessId: string;
}

export function CategoriesScreen({ businessId }: Props) {
  const { data } = useFindManyCategories(businessId);
  return (
    <section className="mx-2 space-y-4">
      <PageHeader title="Categorías" />
      <section className="mx-4">
        <Card>
          <CardHeader className="flex justify-between">
            <div>
              <CardTitle>Categorías</CardTitle>
              <CardDescription>
                Lista de todas las categorías del negocio
              </CardDescription>
            </div>
            <div>
              <Button className="rounded-full" asChild>
                <Link
                  to="/business/$id/categories/create"
                  params={{
                    id: businessId,
                  }}
                >
                  Nueva categoría
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>
      <section className="mx-4">
        <Card>
          <CardContent>
            <CategorySummaryTable.Root data={data}>
              <CategorySummaryTable.Content>
                <CategorySummaryTable.Header />
                <CategorySummaryTable.Body />
              </CategorySummaryTable.Content>
            </CategorySummaryTable.Root>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
