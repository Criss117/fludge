import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/core/shared/components/ui/button";
import { Checkbox } from "@/core/shared/components/ui/checkbox";
import type { CategorySummary } from "@repo/core/entities/category";

const columnsHelper = createColumnHelper<CategorySummary>();

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
    cell: (info) => (
      <Button asChild variant="link">
        <Link
          to="/business/$id/categories/$categoryid"
          params={{
            id: info.row.original.businessId,
            categoryid: info.row.original.id,
          }}
        >
          {info.getValue()}
        </Link>
      </Button>
    ),
  }),
  columnsHelper.accessor("description", {
    header: "Descripción",
    cell: (info) => info.getValue() ?? "-",
  }),
  columnsHelper.accessor("createdAt", {
    header: "Creado",
    cell: (info) => formatDistanceToNow(info.getValue(), { locale: es }),
  }),
];
