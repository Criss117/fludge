import { createColumnHelper } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { UserSummary } from "@repo/core/entities/user";

const columnHelper = createColumnHelper<UserSummary>();

export const columns = [
  columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
    id: "fullName",
    header: "Nombre completo",
  }),
  columnHelper.accessor("username", {
    header: "Nombre de usuario",
    cell: (info) => info.getValue(),
  }),
];

export function useEmployeesSummaryTable(data: UserSummary[]) {
  const table = useReactTable({
    columns: columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return table;
}
