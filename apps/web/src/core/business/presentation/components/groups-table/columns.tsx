import { PermissionBadge } from "@/core/shared/components/permission-badge";
import { Checkbox } from "@/core/shared/components/ui/checkbox";
import type { GroupSummary } from "@repo/core/entities/group";
import { createColumnHelper } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const columnsHelper = createColumnHelper<GroupSummary>();

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
    header: "Nombre del grupo",
    cell: (info) => info.getValue(),
  }),
  columnsHelper.accessor("description", {
    header: "Descripción del grupo",
    cell: (info) => (info.getValue() ? info.getValue() : "-"),
  }),
  columnsHelper.accessor("permissions", {
    header: "Permisos",
    cell: ({ getValue }) => {
      const firstFivePermissions = getValue().slice(0, 5);

      return (
        <div className="space-x-2">
          {firstFivePermissions.map((p) => (
            <PermissionBadge permission={p} />
          ))}
          <span>{getValue().length > 5 && "..."}</span>
        </div>
      );
    },
  }),
  columnsHelper.accessor("createdAt", {
    header: "Tiempo de creación",
    cell: ({ getValue }) => {
      return formatDistanceToNow(getValue(), {
        addSuffix: true,
        locale: es,
      });
    },
  }),
];
