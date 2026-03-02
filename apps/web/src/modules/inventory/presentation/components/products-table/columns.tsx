import { createColumnHelper } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";

import { Button } from "@shared/components/ui/button";
import { cn, formatCurrency } from "@shared/lib/utils";

import type { Product } from "@inventory/application/collections/products.collection";
import { WithChevronButton } from "./column-headers";
import { ProductsTableActions } from "./actions";

const columnHelper = createColumnHelper<Product>();

export function productsTableColumns(orgSlug: string) {
  return [
    columnHelper.accessor((p) => p.sku, {
      id: "sku",
      header: "SKU",
    }),
    columnHelper.accessor((p) => p.name, {
      id: "name",
      header: "Nombre",
    }),
    columnHelper.accessor((p) => p.description, {
      id: "description",
      header: "Descripción",
      cell: ({ getValue }) => {
        return <span>{getValue() || "-"}</span>;
      },
    }),
    columnHelper.accessor((p) => p.stock, {
      id: "stock",
      header: () => <WithChevronButton label="Stock" valueKey="stock" />,
      cell: ({ row }) => {
        const stock = row.original.stock;
        const minStock = row.original.minStock;
        const canNegativeStock = minStock === 0;
        const isLowStock = stock <= minStock;

        return (
          <div className="flex flex-col">
            <span
              className={cn(
                canNegativeStock
                  ? ""
                  : isLowStock
                    ? "text-red-500"
                    : "text-green-500",
              )}
            >
              {stock}
            </span>
            <span>
              {canNegativeStock
                ? "(sin seguimiento)"
                : isLowStock
                  ? "(Bajo)"
                  : "(Suficiente)"}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor((p) => p.costPrice, {
      id: "costPrice",
      header: () => (
        <WithChevronButton label="Precio de Costo" valueKey="costPrice" />
      ),
      cell: ({ getValue }) => {
        return <span>{formatCurrency(getValue())}</span>;
      },
    }),
    columnHelper.accessor((p) => p.salePrice, {
      id: "salePrice",
      header: () => (
        <WithChevronButton label="Precio de Venta" valueKey="salePrice" />
      ),
      cell: ({ getValue }) => {
        return <span>{formatCurrency(getValue())}</span>;
      },
    }),
    columnHelper.accessor((p) => p.wholesalePrice, {
      id: "wholesalePrice",
      header: () => (
        <WithChevronButton
          label="Precio al por mayor"
          valueKey="wholesalePrice"
        />
      ),
      cell: ({ getValue }) => {
        return <span>{formatCurrency(getValue())}</span>;
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => <ProductsTableActions product={row.original} />,
    }),
  ];
}
