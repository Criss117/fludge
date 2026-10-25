import { FiltersProvider } from "@fludge/client/providers/filters.provider";

import { ProductsScreen } from "@/core/catalog/screens/products";

export default function Catalog() {
  return (
    <FiltersProvider>
      <ProductsScreen />
    </FiltersProvider>
  );
}
