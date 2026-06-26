import { Card, CardContent } from "@fludge/ui/components/card";
import { useFilters } from "@fludge/client/presentation/shared/context/filter.context";
import { SearchInput } from "@fludge/ui/components/search-input";

export function ProductsFiltersSection() {
  const { filters, dispatch } = useFilters();

  return (
    <Card>
      <CardContent>
        <div className="w-1/3">
          <SearchInput
            value={filters.query}
            onChange={(v) =>
              dispatch({
                type: "set:query",
                payload: v,
              })
            }
            placeholder="Buscar por nombre, SKU o código..."
          />
        </div>
        <div></div>
      </CardContent>
    </Card>
  );
}