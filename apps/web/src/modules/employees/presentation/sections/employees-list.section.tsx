import { useDataTable } from "@shared/components/data-table";
import { useFilters } from "@/modules/shared/store/filters.store";
import { SearchInput } from "@shared/components/search-input";

import { employeesTableColumns } from "@employees/presentation/components/employees-table/columns";
import { useFindAllEmployees } from "@employees/application/hooks/use-employees-queries";

interface Props {
  orgSlug: string;
}

export function EmployeesListSection({ orgSlug }: Props) {
  const { filters, filtersDispatch } = useFilters();
  const employees = useFindAllEmployees({
    email: filters.query,
    name: filters.query,
  });

  const table = useDataTable({
    columns: employeesTableColumns(orgSlug),
    data: employees || [],
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
