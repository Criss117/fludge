import { useFilters } from "@shared/store/filters.store";
import { useFindManyProducts } from "@inventory/application/hooks/use-products-queries";
import { ProductsTable } from "../components/products-table";
import { useVerifiedSession } from "@/integrations/auth/context";

export function ProductsTableSection() {
  const session = useVerifiedSession();
  const { filters } = useFilters();

  const products = useFindManyProducts({
    limit: filters.limit,
    page: filters.page,
    name: filters.query,
    sku: filters.query,
    orderBy: {
      stock: filters.orderBy.get("stock"),
      costPrice: filters.orderBy.get("costPrice"),
      salePrice: filters.orderBy.get("salePrice"),
      wholesalePrice: filters.orderBy.get("wholesalePrice"),
    },
  });

  return (
    <ProductsTable.Root
      products={products}
      orgSlug={session.activeOrganization.slug}
    >
      <ProductsTable.Content />
    </ProductsTable.Root>
  );
}
