import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "@fludge/ui/components/button";
import { Card, CardContent } from "@fludge/ui/components/card";
import { Input } from "@fludge/ui/components/input";
import { useFilters } from "@fludge/client/presentation/shared/context/filter.context";

export function MembersFiltersSection() {
  const { filters, dispatch } = useFilters();

  return (
    <Card>
      <CardContent>
        <div className="w-1/3">
          <div className="relative">
            <Button
              className="absolute left-0"
              size="icon"
              disabled
              variant="ghost"
            >
              <SearchIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0"
              onClick={() =>
                dispatch({
                  type: "reset:query",
                })
              }
            >
              <XIcon />
            </Button>
            <Input
              value={filters.query}
              className="w-full pl-8"
              placeholder="Buscar miembros"
              onChange={(v) =>
                dispatch({
                  type: "set:query",
                  payload: v.target.value,
                })
              }
            />
          </div>
        </div>
        <div></div>
      </CardContent>
    </Card>
  );
}
