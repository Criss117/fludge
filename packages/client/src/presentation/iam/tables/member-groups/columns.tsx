import { createColumnHelper } from "@tanstack/react-table";

import type { MemberGroup } from "@fludge/client/application/iam/hooks/use-find-members";

const columnHelper = createColumnHelper<MemberGroup>();

export interface MemberGroupsTableSlot<TNode> {
  nameCell?: (row: MemberGroup) => TNode;
}

export function memberGroupsTableColumns<TNode>(
  slots: MemberGroupsTableSlot<TNode>,
) {
  return [
    columnHelper.accessor((row) => row.name, {
      header: "Nombre",
      cell: (info) => slots.nameCell?.(info.row.original) ?? info.getValue(),
    }),
    columnHelper.display({
      id: "permissions",
      header: "Permisos",
      cell: (info) => info.row.original.permissions.length + " Permisos",
    }),
    columnHelper.accessor((row) => row.description, {
      header: "Descripción",
      cell: (info) => info.getValue() || "—",
    }),
  ];
}

export type MemberGroupsTableColumns<TNode> = ReturnType<
  typeof memberGroupsTableColumns<TNode>
>;