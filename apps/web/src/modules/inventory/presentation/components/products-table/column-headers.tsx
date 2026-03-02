import { ChevronDown, ChevronUp, MinusIcon } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { useFilters } from "@shared/store/filters.store";

interface WithChevronButtonProps {
  label: string;
  valueKey: string;
}

export function WithChevronButton({ label, valueKey }: WithChevronButtonProps) {
  const { filters, filtersDispatch } = useFilters();

  const orderByStock = filters.orderBy.get(valueKey);

  const toggleOrderBy = () => {
    filtersDispatch({
      action: "toogle:order-by",
      payload: valueKey,
    });
  };

  return (
    <Button variant="ghost" onClick={toggleOrderBy}>
      <span>{label}</span>
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
