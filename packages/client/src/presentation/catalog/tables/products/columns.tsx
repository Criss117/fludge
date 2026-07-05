import { createColumnHelper } from "@tanstack/react-table";

import type { ProductSummary } from "@fludge/client/application/catalog/hooks/use-find-products";
import { formatPrice } from "@fludge/utils/currency";

const columnHelper = createColumnHelper<ProductSummary>();

export interface ProductsTableActionsSlot<TNode> {
  renderActions: (row: ProductSummary) => TNode;
  nameCell?: (row: ProductSummary) => TNode;
  statusCell?: (row: ProductSummary) => TNode;
  stockCell?: (row: ProductSummary) => TNode;
  categoryCell?: (row: ProductSummary) => TNode;
  createdByCell?: (row: ProductSummary) => TNode;
}

export function productsTableColumns<TNode>(
  slots: ProductsTableActionsSlot<TNode>,
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
    columnHelper.accessor((row) => row.sku, {
      header: "SKU",
      cell: (info) => info.getValue() ?? "-",
    }),
    columnHelper.accessor((row) => row.barcode, {
      header: "Código de Barras",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => row.priceRetail, {
      header: "Precio Venta",
      cell: (info) => {
        const value = info.getValue();
        if (value === null || value === undefined) return "—";
        return formatPrice(Number(value));
      },
    }),
    columnHelper.display({
      id: "stock",
      header: "Stock",
      cell: (info) =>
        slots.stockCell?.(info.row.original) ??
        String(info.row.original.stockQuantity),
    }),
    columnHelper.display({
      id: "status",
      header: "Estado",
      cell: (info) =>
        slots.statusCell?.(info.row.original) ?? info.row.original.status,
    }),
    columnHelper.accessor((row) => row.category, {
      header: "Categoría",
      cell: (info) =>
        slots.categoryCell?.(info.row.original) ??
        info.row.original.category?.name ??
        "-",
    }),
    columnHelper.accessor((row) => row.createdBy, {
      header: "Creado Por",
      cell: (info) =>
        slots.createdByCell?.(info.row.original) ??
        info.row.original.createdBy?.user.name ??
        "-",
    }),
    columnHelper.accessor((row) => row.updatedAt, {
      header: "Última Actualización",
      cell: (info) => info.getValue().toLocaleDateString(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => slots.renderActions(info.row.original),
    }),
  ];
}

export type ProductsTableColumns<TNode> = ReturnType<
  typeof productsTableColumns<TNode>
>;
