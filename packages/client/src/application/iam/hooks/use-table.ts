import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { GroupSummary } from "./use-find-groups";
import type { GroupsTableColumns } from "@fludge/client/presentation/iam/tables/groups/columns";

interface Params<TNode> {
  data: GroupSummary[];
  columns: GroupsTableColumns<TNode>;
}

export function useGroupsTable<TNode>({ data, columns }: Params<TNode>) {
  return useReactTable({
    columns,
    data,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
}
