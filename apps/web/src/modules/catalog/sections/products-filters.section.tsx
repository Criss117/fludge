import { Card, CardContent } from "@fludge/ui/components/card";
import { Button } from "@fludge/ui/components/button";
import { useFilters } from "@fludge/client/presentation/shared/context/filter.context";
import type { SortDirection } from "@fludge/client/presentation/shared/context/filter.context";
import { SearchInput } from "@fludge/ui/components/search-input";
import { ArrowUp, ArrowDown } from "lucide-react";

interface SortChipProps {
  label: string;
  sortKey: string;
  current: { key: string; direction: SortDirection };
  onCycle: (next: { key: string; direction: SortDirection }) => void;
}

function SortChip({ label, sortKey, current, onCycle }: SortChipProps) {
  const isActive = current.key === sortKey;
  const direction = isActive ? current.direction : null;

  const handleClick = () => {
    if (!isActive || direction === null) {
      onCycle({ key: sortKey, direction: "asc" });
    } else if (direction === "asc") {
      onCycle({ key: sortKey, direction: "desc" });
    } else {
      onCycle({ key: "", direction: null });
    }
  };

  const ariaLabel = direction
    ? `Ordenar ${label} ${direction === "asc" ? "ascendente" : "descendente"}`
    : `Ordenar ${label}`;

  return (
    <Button
      type="button"
      size="sm"
      variant={isActive ? "secondary" : "outline"}
      onClick={handleClick}
      aria-pressed={isActive}
      aria-label={ariaLabel}
    >
      {label}
      {direction === "asc" ? <ArrowUp /> : null}
      {direction === "desc" ? <ArrowDown /> : null}
    </Button>
  );
}

export function ProductsFiltersSection() {
  const { filters, dispatch } = useFilters();

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
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
          <div className="flex gap-2">
            <SortChip
              label="Stock"
              sortKey="stock"
              current={filters.sort}
              onCycle={(next) =>
                dispatch({ type: "set:sort", payload: next })
              }
            />
            <SortChip
              label="Precio Venta"
              sortKey="priceRetail"
              current={filters.sort}
              onCycle={(next) =>
                dispatch({ type: "set:sort", payload: next })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}