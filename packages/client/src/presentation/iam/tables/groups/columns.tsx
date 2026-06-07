import { createColumnHelper } from "@tanstack/react-table";

import type { GroupSummary } from "@fludge/client/application/iam/hooks/use-find-groups";

const columnHelper = createColumnHelper<GroupSummary>();

export const groupsTableColumns = [
  columnHelper.accessor((row) => row.name, {
    header: "Nombre",
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: "members",
    header: "Miembros",
    cell: (info) => info.row.original.members.size,
  }),
  columnHelper.display({
    id: "permissions",
    header: "Permisos",
    cell: (info) => info.row.original.permissions.length + " Permisos",
  }),
  columnHelper.accessor((row) => row.updatedAt, {
    header: "Última Actualización",
    cell: (info) => info.getValue().toLocaleDateString(),
  }),
  columnHelper.accessor((row) => row.createdBy, {
    header: "Creado Por",
    cell: (info) => info.getValue()?.name || "-",
  }),
];

export type GroupsTableColumns = typeof groupsTableColumns;
