import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { GroupSummary } from "./use-find-groups";
import type { GroupsTableColumns } from "@fludge/client/presentation/iam/tables/groups/columns";

interface Params {
  data: GroupSummary[];
  columns: GroupsTableColumns;
}

export function useGroupsTable({ data, columns }: Params) {
  return useReactTable({
    columns,
    data,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
}
