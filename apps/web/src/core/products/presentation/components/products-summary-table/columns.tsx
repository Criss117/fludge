import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/core/shared/components/ui/checkbox";
import type { ProductSummary } from "@repo/core/entities/product";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/core/shared/lib/utils";

const columnsHelper = createColumnHelper<ProductSummary>();

export const columns = [
  columnsHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  }),
  columnsHelper.accessor("name", {
    header: "Nombre",
  }),
  columnsHelper.accessor("barcode", {
    header: "Código de barras",
  }),
  columnsHelper.accessor("stock", {
    header: "Stock actual",
  }),
  columnsHelper.accessor("purchasePrice", {
    header: "Precio de compra",
    cell: ({ cell }) => <span>$ {formatCurrency(cell.getValue())}</span>,
  }),
  columnsHelper.accessor("salePrice", {
    header: "Precio de venta",
    cell: ({ cell }) => <span>$ {formatCurrency(cell.getValue())}</span>,
  }),
  columnsHelper.accessor("createdAt", {
    header: "Creado",
    cell: ({ cell }) => (
      <span>{formatDistanceToNow(cell.getValue(), { locale: es })}</span>
    ),
  }),
];
