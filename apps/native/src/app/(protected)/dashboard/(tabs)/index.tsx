import { FiltersProvider } from "@fludge/client/providers/filters.provider";

import { SalesScreen } from "@/core/commerce/screens/sales";

export default function Sales() {
  return (
    <FiltersProvider
      initialState={{
        status: "all",
        orderBy: [
          {
            direction: "desc",
            field: "createdAt",
          },
        ],
      }}
    >
      <SalesScreen />
    </FiltersProvider>
  );
}
