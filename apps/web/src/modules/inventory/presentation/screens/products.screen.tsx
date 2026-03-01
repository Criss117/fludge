import { Suspense } from "react";
import { FiltersProvider } from "@/modules/shared/store/filters.store";

import { ProductsHeaderSection } from "@inventory/presentation/sections/products-header.section";
import { ProductsTableSection } from "@inventory/presentation/sections/products-table.section";
import { ProductsFiltersSection } from "@inventory/presentation/sections/products-filters.section";
import { useCountAllProducts } from "@inventory/application/hooks/use-products-queries";

export function ProductsScreen() {
  const totalProducts = useCountAllProducts();

  return (
    <div className="px-5 mt-4 mb-8 space-y-8">
      <ProductsHeaderSection totalProducts={totalProducts} />
      <div className="space-y-4">
        <FiltersProvider>
          <Suspense>
            <ProductsFiltersSection totalProducts={totalProducts} />
          </Suspense>
          <Suspense>
            <ProductsTableSection />
          </Suspense>
          <Suspense>
            <ProductsFiltersSection totalProducts={totalProducts} />
          </Suspense>
        </FiltersProvider>
      </div>
    </div>
  );
}
