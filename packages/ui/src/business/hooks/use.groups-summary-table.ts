import { GroupSummary } from "@repo/core/entities/group";
import { createColumnHelper } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

const columnHelper = createColumnHelper<GroupSummary>();

export const columns = [
  columnHelper.accessor("name", {
    header: "Nombre del grupo",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("description", {
    header: "Descripción del grupo",
    cell: (info) => (info.getValue() ? info.getValue() : "-"),
  }),
];

export function useGroupsSummaryTable(data: GroupSummary[]) {
  const table = useReactTable({
    columns: columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return table;
}
