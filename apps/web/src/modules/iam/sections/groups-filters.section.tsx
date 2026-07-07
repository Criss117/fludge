import { Card, CardContent } from "@fludge/ui/components/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fludge/ui/components/select";
import {
  GroupBy,
  useFilters,
} from "@fludge/client/presentation/shared/context/filter.context";
import { SearchInput } from "@fludge/ui/components/search-input";

const STATUS_OPTIONS = [
  { label: "Todos", value: GroupBy.all },
  { label: "Activos", value: GroupBy.active },
  { label: "Inactivos", value: GroupBy.inactive },
] as const;

export function GroupsFiltersSection() {
  const { filters, dispatch } = useFilters();

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-1/3">
            <SearchInput
              value={filters.query}
              onChange={(v) =>
                dispatch({
                  type: "set:query",
                  payload: v,
                })
              }
              placeholder="Buscar grupos"
            />
          </div>
          <div className="w-48">
            <Select
              items={STATUS_OPTIONS}
              value={filters.group}
              defaultValue={GroupBy.all}
              onValueChange={(v) => {
                if (!v) return;
                dispatch({
                  type: "set:group",
                  payload: v,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}