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
    limit: 2,
    page: 0,
  });

  const items = data.pages.flatMap((page) => page.items);

  return (
    <section className="mx-2 space-y-4">
      <ProductSummaryTable.Root data={items}>
        <PageHeader>
          <PageHeaderHome businessId={businessId} />
          <PageHeaderProducts isPage />
        </PageHeader>
        <section className="mx-4">
          <ProductsHeader
            businessId={businessId}
            totalProducts={items.length}
          />
        </section>
        <section className="mx-4">
          <ProductSummaryTable.Content>
            <ProductSummaryTable.Header />
            <ProductSummaryTable.Body />
          </ProductSummaryTable.Content>
          <ProductSummaryTable.PaginationControllers />
        </section>
      </ProductSummaryTable.Root>
    </section>
  );
}
