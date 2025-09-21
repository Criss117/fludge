import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Button } from "@/core/shared/components/ui/button";
import type { CategorySummary } from "@repo/core/entities/category";

const columnHelper = createColumnHelper<CategorySummary>();

export const columns = [
  columnHelper.accessor("name", {
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
  columnHelper.accessor("description", {
    header: "Descripción",
    cell: (info) => info.getValue() ?? "-",
  }),
  columnHelper.accessor("createdAt", {
    header: "Creado",
    cell: (info) => formatDistanceToNow(info.getValue(), { locale: es }),
  }),
];
