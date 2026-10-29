import { FiltersProvider } from "@fludge/client/providers/filters.provider";

import { CustomersScreen } from "@/core/commerce/screens/customers";

export default function Customers() {
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
      <CustomersScreen />
    </FiltersProvider>
  );
}
