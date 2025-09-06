import { PermissionBadge } from "@/core/shared/components/permission-badge";
import { Button } from "@/core/shared/components/ui/button";
import { Checkbox } from "@/core/shared/components/ui/checkbox";
import type { GroupSummary } from "@repo/core/entities/group";
import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const columnsHelper = createColumnHelper<GroupSummary>();

export const columns = (businessId: string) => [
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
    cell: (info) => (
      <Button variant="link" asChild>
        <Link
          to="/business/$id/groups/$groupid"
          params={{
            id: businessId,
            groupid: info.row.original.id,
          }}
        >
          {info.getValue()}
        </Link>
      </Button>
    ),
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
            <PermissionBadge permission={p} key={p} />
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
