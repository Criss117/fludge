import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { GroupSummary } from "./use-find-groups";
import type { MemberSummary } from "./use-find-members";
import type { GroupsTableColumns } from "@fludge/client/presentation/iam/tables/groups/columns";
import type { MembersTableColumns } from "@fludge/client/presentation/iam/tables/members/columns";

interface GroupsParams<TNode> {
  data: GroupSummary[];
  columns: GroupsTableColumns<TNode>;
}

interface MembersParams<TNode> {
  data: MemberSummary[];
  columns: MembersTableColumns<TNode>;
}
export function useGroupsTable<TNode>({ data, columns }: GroupsParams<TNode>) {
  return useReactTable({
    columns,
    data,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
}

export function useMembersTable<TNode>({
  data,
  columns,
}: MembersParams<TNode>) {
  return useReactTable({
    columns,
    data,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
}
