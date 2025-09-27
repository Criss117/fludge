import { ProductSummaryTable } from "../components/products-summary-table";
import { useFindManyProducts } from "@/core/products/application/hooks/use.find-many-products";
import { ProductsHeader } from "../sections/products-header.section";
import {
  PageHeader,
  PageHeaderHome,
  PageHeaderProducts,
} from "@/core/shared/components/page-header-bread-crumb";

interface Props {
  businessId: string;
}

export function ProductsScreen({ businessId }: Props) {
  const { data } = useFindManyProducts({
    businessId,
  });
  return (
    <section className="mx-2 space-y-4">
      <ProductSummaryTable.Root data={data}>
        <PageHeader>
          <PageHeaderHome businessId={businessId} />
          <PageHeaderProducts isPage />
        </PageHeader>
        <section className="mx-4">
          <ProductsHeader businessId={businessId} totalProducts={data.length} />
        </section>
        <section className="mx-4">
          <ProductSummaryTable.Content>
            <ProductSummaryTable.Header />
            <ProductSummaryTable.Body />
          </ProductSummaryTable.Content>
        </section>
      </ProductSummaryTable.Root>
    </section>
  );
}
