import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { useDataTable } from "@/modules/shared/components/data-table";
import { useEmployeesQueries } from "@/modules/employees/application/hooks/use-employees-queries";
import { employeesTableColumns } from "../components/employees-table/columns";
import { useFilters } from "@/modules/shared/store/teams-filters.store";
import { SearchInput } from "@/modules/shared/components/search-input";

interface Props {
  orgSlug: string;
}

export function EmployeesListSection({ orgSlug }: Props) {
  const { findManyEmployees } = useEmployeesQueries();
  const { filters, filtersDispatch } = useFilters();

  const { data } = useLiveSuspenseQuery(
    () =>
      findManyEmployees({
        filterBy: {
          name: filters.query,
          email: filters.query,
        },
      }),
    [filters.query],
  );

  const table = useDataTable({
    columns: employeesTableColumns(orgSlug),
    data: data || [],
    getRowId: (row) => row.id,
  });

  return (
    <section className="space-y-4">
      <header className="flex justify-between items-center">
        <div className="w-1/3">
          <SearchInput
            placeholder="Buscar empleados por nombre o correo"
            value={filters.query}
            onChange={(value) =>
              filtersDispatch({ action: "set:query", payload: value })
            }
          />
        </div>

        <div className="gap-x-2 flex items-center">
          <table.FirstPageButton />
          <table.PrevButton />
          <table.PageSizeSelect />
          <table.NextButton />
          <table.LastPageButton />
        </div>
      </header>

      <table.Content emptyMessage="No hay Equipos Creados" />

      <footer className="flex gap-x-2 items-center justify-end">
        <table.FirstPageButton />
        <table.PrevButton />
        <table.PageSizeSelect />
        <table.NextButton />
        <table.LastPageButton />
      </footer>
    </section>
  );
}
