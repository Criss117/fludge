import type { MemberSummary } from "@fludge/client/application/iam/hooks/use-find-members";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<MemberSummary>();

export interface MembersTableActionsSlot<TNode> {
  renderActions: (row: MemberSummary) => TNode;
  groupsAssigned: (row: MemberSummary["groups"]) => TNode;
}

export function membersTableColumns<TNode>(
  slots: MembersTableActionsSlot<TNode>,
) {
  return [
    columnHelper.accessor((row) => row.user.name, {
      header: "Nombre",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => row.user.email, {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "groups",
      header: "Grupos Asignados",
      cell: (info) => slots.groupsAssigned(info.row.original.groups),
    }),
    columnHelper.accessor((row) => row.createdAt, {
      header: "Ingresado el",
      cell: (info) => info.getValue().toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => slots.renderActions(info.row.original),
    }),
  ];
}

export type MembersTableColumns<TNode> = ReturnType<
  typeof membersTableColumns<TNode>
>;
