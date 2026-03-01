import { createColumnHelper } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";

import { Button } from "@shared/components/ui/button";
import { cn, formatCurrency } from "@shared/lib/utils";

import type { Product } from "@inventory/application/collections/products.collection";
import { StockColumnHeader } from "./column-headers";

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
    }),
    columnHelper.accessor((p) => p.stock, {
      id: "stock",
      header: () => <StockColumnHeader />,
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
      header: "Precio de Costo",
      cell: ({ getValue }) => {
        return <span>{formatCurrency(getValue())}</span>;
      },
    }),
    columnHelper.accessor((p) => p.salePrice, {
      id: "salePrice",
      header: "Precio de Venta",
      cell: ({ getValue }) => {
        return <span>{formatCurrency(getValue())}</span>;
      },
    }),
    columnHelper.accessor((p) => p.wholesalePrice, {
      id: "wholesalePrice",
      header: "Precio al por mayor",
      cell: ({ getValue }) => {
        return <span>{formatCurrency(getValue())}</span>;
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: () => (
        <Button variant="ghost" size="icon">
          <MoreVertical />
        </Button>
      ),
    }),
  ];
}
