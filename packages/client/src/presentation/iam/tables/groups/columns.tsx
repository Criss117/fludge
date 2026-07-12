import { createColumnHelper } from "@tanstack/react-table";

import { formatDistance } from "date-fns";
import { es } from "date-fns/locale/es";
import type { GroupSummary } from "@fludge/client/application/iam/hooks/use-find-groups";

const columnHelper = createColumnHelper<GroupSummary>();

export interface GroupsTableActionsSlot<TNode> {
  renderActions: (row: GroupSummary) => TNode;
  nameCell?: (row: GroupSummary) => TNode;
}

export function groupsTableColumns<TNode>(
  slots: GroupsTableActionsSlot<TNode>,
) {
  return [
    columnHelper.accessor((row) => row.name, {
      header: "Nombre",
      cell: (info) => slots.nameCell?.(info.row.original) ?? info.getValue(),
    }),
    columnHelper.display({
      id: "members",
      header: "Miembros",
      cell: (info) => info.row.original.members[0]?.total ?? 0,
    }),
    columnHelper.display({
      id: "permissions",
      header: "Permisos",
      cell: (info) => info.row.original.permissions.length + " Permisos",
    }),
    columnHelper.accessor((row) => row.createdBy, {
      header: "Creado Por",
      cell: (info) => info.getValue()?.user.name || "-",
    }),
    columnHelper.accessor((row) => row.updatedAt, {
      header: "Última Actualización",
      cell: (info) =>
        formatDistance(info.getValue(), new Date(), {
          locale: es,
          addSuffix: true,
        }),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => slots.renderActions(info.row.original),
    }),
  ];
}

export type GroupsTableColumns<TNode> = ReturnType<
  typeof groupsTableColumns<TNode>
>;
