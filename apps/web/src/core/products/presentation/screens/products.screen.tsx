import { useState } from "react";
import { ProductSummaryTable } from "../components/products-summary-table";
import { useFindManyProducts } from "@/core/products/application/hooks/use.find-many-products";
import { ProductsHeader } from "../sections/products-header.section";
import {
  PageHeader,
  PageHeaderHome,
  PageHeaderProducts,
} from "@/core/shared/components/page-header-bread-crumb";
import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";

interface Props {
  businessId: string;
}

//TODO: use query params to get the pagination
function Table({ businessId }: Props) {
  const [pagination, setPagination] = useState({
    limit: 20,
    page: 0,
  });

  const {
    data,
    hasNextPage,
    isFetching,
    hasPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
  } = useFindManyProducts({
    businessId,
    limit: pagination.limit,
    page: pagination.page,
  });

  const page = data.pages[pagination.page];

  return (
    <ProductSummaryTable.Root
      data={page.items}
      pagination={{
        pageIndex: pagination.page,
        pageSize: pagination.limit,
      }}
      isPending={isFetching}
    >
      <section className="mx-4">
        <ProductsHeader
          businessId={businessId}
          totalProducts={page.items.length}
        />
      </section>
      <section className="mx-4">
        <ProductSummaryTable.Content>
          <ProductSummaryTable.Header />
          <ProductSummaryTable.Body />
        </ProductSummaryTable.Content>
        <ProductSummaryTable.PaginationControllers
          totalPages={page.totalPages}
          hasNextPage={hasNextPage || pagination.page < data.pages.length - 1}
          hasPreviousPage={hasPreviousPage || pagination.page > 0}
          fetchNextPage={() =>
            fetchNextPage().then(() =>
              setPagination({
                page: pagination.page + 1,
                limit: pagination.limit,
              })
            )
          }
          fetchPreviousPage={() =>
            fetchPreviousPage().then(() =>
              setPagination({
                page: pagination.page - 1,
                limit: pagination.limit,
              })
            )
          }
        />
      </section>
    </ProductSummaryTable.Root>
  );
}

export function ProductsScreen({ businessId }: Props) {
  return (
    <section className="mx-2 space-y-4">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderProducts isPage />
      </PageHeader>

      <Table businessId={businessId} />
    </section>
  );
}

export function WithOutPermissions({ businessId }: Props) {
  return (
    <section className="mx-2 space-y-4">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderProducts isPage />
      </PageHeader>

      <UserHasNoPermissionAlert />
    </section>
  );
}
