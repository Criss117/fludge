import { ChevronDown, ChevronUp, MinusIcon } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { useFilters } from "@shared/store/filters.store";

export function StockColumnHeader() {
  const { filters, filtersDispatch } = useFilters();

  const orderByStock = filters.orderBy.get("stock");

  const toggleOrderBy = () => {
    filtersDispatch({
      action: "toogle:order-by",
      payload: "stock",
    });
  };

  return (
    <Button variant="ghost" onClick={toggleOrderBy}>
      <span>Stock</span>
      {!orderByStock ? (
        <MinusIcon />
      ) : orderByStock === "desc" ? (
        <ChevronDown />
      ) : (
        <ChevronUp />
      )}
    </Button>
  );
}
