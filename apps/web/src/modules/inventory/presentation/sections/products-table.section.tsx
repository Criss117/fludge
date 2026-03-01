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
    },
  });

  return (
    <ProductsTable.Root
      products={products}
      orgSlug={session.activeOrganization.slug}
    >
      <p>Total Products: {products.length}</p>
      <ProductsTable.Content />
    </ProductsTable.Root>
  );
}
