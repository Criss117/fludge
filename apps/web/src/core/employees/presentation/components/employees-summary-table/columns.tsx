import { createColumnHelper } from "@tanstack/react-table";
import { es } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { Checkbox } from "@/core/shared/components/ui/checkbox";
import type { UserSummary } from "@repo/core/entities/user";

const columnHelper = createColumnHelper<UserSummary>();

export const columns = [
  columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
    id: "fullName",
    header: "Nombre completo",
  }),
  columnHelper.accessor("username", {
    header: "Nombre de usuario",
    cell: (info) => info.getValue(),
  }),
];

export const completeColumns = [
  columnHelper.display({
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
  columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
    id: "fullName",
    header: "Nombre completo",
  }),
  columnHelper.accessor("username", {
    header: "Nombre de usuario",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("createdAt", {
    header: "Creado el",
    cell: (info) =>
      formatDistanceToNow(info.getValue(), { addSuffix: true, locale: es }),
  }),
];
