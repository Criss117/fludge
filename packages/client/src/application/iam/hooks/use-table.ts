import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { GroupSummary } from "./use-find-groups";
import type { MemberGroup, MemberSummary } from "./use-find-members";
import type { GroupsTableColumns } from "@fludge/client/presentation/iam/tables/groups/columns";
import type { MembersTableColumns } from "@fludge/client/presentation/iam/tables/members/columns";
import type { MemberGroupsTableColumns } from "@fludge/client/presentation/iam/tables/member-groups/columns";

interface GroupsParams<TNode> {
  data: GroupSummary[];
  columns: GroupsTableColumns<TNode>;
}

interface MembersParams<TNode> {
  data: MemberSummary[];
  columns: MembersTableColumns<TNode>;
}

interface MemberGroupsParams<TNode> {
  data: MemberGroup[];
  columns: MemberGroupsTableColumns<TNode>;
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

export function useMemberGroupsTable<TNode>({
  data,
  columns,
}: MemberGroupsParams<TNode>) {
  return useReactTable({
    columns,
    data,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
}
