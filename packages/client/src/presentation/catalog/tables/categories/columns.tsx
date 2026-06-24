import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@fludge/ui/components/badge";

import type { CategorySummary } from "@fludge/client/application/catalog/hooks/use-find-categories";

const columnHelper = createColumnHelper<CategorySummary>();

export interface CategoriesTableActionsSlot<TNode> {
  renderActions: (row: CategorySummary) => TNode;
  nameCell?: (row: CategorySummary) => TNode;
}

export function categoriesTableColumns<TNode>(
  slots: CategoriesTableActionsSlot<TNode>,
) {
  return [
    columnHelper.accessor((row) => row.name, {
      header: "Nombre",
      cell: (info) => slots.nameCell?.(info.row.original) ?? info.getValue(),
    }),
    columnHelper.accessor((row) => row.slug, {
      header: "Slug",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "status",
      header: "Estado",
      cell: (info) =>
        info.row.original.deletedAt ? (
          <Badge variant="secondary">Inactivo</Badge>
        ) : (
          <Badge>Activo</Badge>
        ),
    }),
    columnHelper.accessor((row) => row.updatedAt, {
      header: "Última Actualización",
      cell: (info) => info.getValue().toLocaleDateString(),
    }),
    columnHelper.accessor((row) => row.createdBy, {
      header: "Creado Por",
      cell: (info) => info.getValue()?.name || "-",
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => slots.renderActions(info.row.original),
    }),
  ];
}

export type CategoriesTableColumns<TNode> = ReturnType<
  typeof categoriesTableColumns<TNode>
>;