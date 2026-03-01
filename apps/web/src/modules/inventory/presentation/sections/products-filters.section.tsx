import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { SearchInput } from "@shared/components/search-input";
import { Button } from "@shared/components/ui/button";
import { Limits, useFilters } from "@shared/store/filters.store";

interface Props {
  totalProducts: number;
}

const LimitItems = Limits.map((limit) => ({
  value: limit,
  label: limit.toString(),
}));

export function ProductsFiltersSection({ totalProducts }: Props) {
  const { filters, filtersDispatch } = useFilters();

  // Calculate the maximum page number based on total products and limit; -1 because page is 0-indexed
  const maxPage = Math.ceil(totalProducts / filters.limit) - 1;

  const nextPage = () => {
    if (filters.page + 1 > maxPage) return;

    filtersDispatch({ action: "set:page", payload: filters.page + 1 });
  };

  const prevPage = () => {
    if (filters.page - 1 < 0) return;

    filtersDispatch({ action: "set:page", payload: filters.page - 1 });
  };

  const lastPage = () =>
    filtersDispatch({ action: "set:page", payload: maxPage });

  const firstPage = () => filtersDispatch({ action: "set:page", payload: 0 });

  return (
    <div className="flex justify-between items-start">
      <div className="w-1/2">
        <SearchInput
          value={filters.query}
          onChange={(value) =>
            filtersDispatch({ action: "set:query", payload: value })
          }
          placeholder="Buscar productos por nombre o codigo"
        />
      </div>

      <div className="flex items-center gap-x-2">
        <Button
          size="icon-sm"
          variant="outline"
          disabled={filters.page === 0}
          onClick={firstPage}
        >
          <ChevronsLeftIcon />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          disabled={filters.page === 0}
          onClick={prevPage}
        >
          <ChevronLeftIcon />
        </Button>
        <Select
          items={LimitItems}
          defaultValue={LimitItems[0].value}
          value={filters.limit}
          onValueChange={(value) => {
            if (value === null) return;

            filtersDispatch({ action: "set:limit", payload: value });
          }}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger>
            <SelectGroup>
              {LimitItems.map((limit) => (
                <SelectItem key={limit.value} value={limit.value}>
                  <span>{limit.label}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          size="icon-sm"
          variant="outline"
          disabled={filters.page === maxPage}
          onClick={nextPage}
        >
          <ChevronRightIcon />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          disabled={filters.page === maxPage}
          onClick={lastPage}
        >
          <ChevronsRightIcon />
        </Button>
      </div>
    </div>
  );
}
