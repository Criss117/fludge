import { useFindManyCategories } from "../../application/hooks/use.find-many-categories";
import { CategorySummaryTable } from "../components/categories-summary-table";
import { PageHeader } from "@/core/shared/components/page-header";
import { CategoriesHeader } from "../sections/categories-header.section";

interface Props {
  businessId: string;
}

export function CategoriesScreen({ businessId }: Props) {
  const { data } = useFindManyCategories(businessId);
  return (
    <section className="mx-2 space-y-4">
      <CategorySummaryTable.Root data={data}>
        <PageHeader title="Categorías" />
        <section className="mx-4">
          <CategoriesHeader
            businessId={businessId}
            totalCategories={data.length}
          />
        </section>
        <section className="mx-4">
          <CategorySummaryTable.Content>
            <CategorySummaryTable.Header />
            <CategorySummaryTable.Body />
          </CategorySummaryTable.Content>
        </section>
      </CategorySummaryTable.Root>
    </section>
  );
}
