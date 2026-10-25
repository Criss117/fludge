import { FiltersProvider } from "@fludge/client/providers/filters.provider";

import { ProductsScreen } from "@/core/catalog/screens/products";

export default function Products() {
  return (
    <FiltersProvider
      initialState={{
        status: "active",
        orderBy: [
          {
            field: "createdAt",
            direction: "asc",
          },
        ],
      }}
    >
      <ProductsScreen />
    </FiltersProvider>
  );
}
