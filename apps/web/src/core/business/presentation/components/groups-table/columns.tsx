import { PermissionBadge } from "@/core/shared/components/permission-badge";
import type { GroupSummary } from "@repo/core/entities/group";
import { createColumnHelper } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const columnsHelper = createColumnHelper<GroupSummary>();

export const columns = (showCOmplete = false) => [
  columnsHelper.accessor("name", {
    header: "Nombre del grupo",
    cell: (info) => info.getValue(),
  }),
  columnsHelper.accessor("description", {
    header: "Descripción del grupo",
    cell: (info) => (info.getValue() ? info.getValue() : "-"),
  }),
  columnsHelper.accessor("permissions", {
    header: showCOmplete ? "Permisos" : "",
    cell: ({ getValue }) => {
      if (!showCOmplete) {
        return "-";
      }

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
    header: showCOmplete ? "Tiempo de creación" : "",
    cell: ({ getValue }) => {
      if (!showCOmplete) {
        return "-";
      }

      return formatDistanceToNow(getValue(), {
        addSuffix: true,
        locale: es,
      });
    },
  }),
];
