import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@fludge/ui/components/badge";

import type { ProductSummary } from "@fludge/client/application/catalog/hooks/use-find-products";

const columnHelper = createColumnHelper<ProductSummary>();

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export interface ProductsTableActionsSlot<TNode> {
  renderActions: (row: ProductSummary) => TNode;
  nameCell?: (row: ProductSummary) => TNode;
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
        return priceFormatter.format(Number(value));
      },
    }),
    columnHelper.display({
      id: "stock",
      header: "Stock",
      cell: (info) => {
        const { stockQuantity, minimumStock } = info.row.original;
        const isLowStock =
          minimumStock > 0 && stockQuantity < minimumStock;
        return (
          <span
            className={
              isLowStock
                ? "text-amber-600 dark:text-amber-400 font-medium"
                : undefined
            }
          >
            {stockQuantity}
            {isLowStock && (
              <span
                className="ml-1 inline-flex size-1.5 rounded-full bg-amber-500"
                aria-label="Stock bajo"
                title={`Stock por debajo del mínimo (${minimumStock})`}
              />
            )}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "status",
      header: "Estado",
      cell: (info) => {
        const status = info.row.original.status;
        switch (status) {
          case "active":
            return (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                Activo
              </Badge>
            );
          case "inactive":
            return <Badge variant="secondary">Inactivo</Badge>;
          case "discontinued":
            return <Badge variant="destructive">Descontinuado</Badge>;
          default:
            return <Badge variant="outline">{status}</Badge>;
        }
      },
    }),
    columnHelper.accessor((row) => row.categoryId, {
      header: "Categoría",
      cell: (info) => {
        const value = info.getValue();
        if (!value) return "-";
        return (
          <span
            className="block max-w-[140px] truncate font-mono text-xs text-muted-foreground"
            title={value}
          >
            {value}
          </span>
        );
      },
    }),
    columnHelper.accessor((row) => row.createdBy, {
      header: "Creado Por",
      cell: (info) => {
        const value = info.getValue();
        if (!value) return "-";
        return (
          <span
            className="block max-w-[140px] truncate font-mono text-xs text-muted-foreground"
            title={value}
          >
            {value}
          </span>
        );
      },
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