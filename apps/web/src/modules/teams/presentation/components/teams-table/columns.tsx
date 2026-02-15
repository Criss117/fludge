import { createColumnHelper } from "@tanstack/react-table";
import { MoreVerticalIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/modules/shared/components/ui/button";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
import type { Team } from "@/modules/teams/application/collections/teams.collection";
import { translatePermission } from "@fludge/utils/validators/permission.schemas";
import { TeamsTableActions } from "./actions";

const columnHelper = createColumnHelper<Team>();

export function teamsTableColumns(orgSlug: string) {
  return [
    columnHelper.display({
      id: "selectors",
      header: ({ table }) => {
        return (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        );
      },
    }),
    columnHelper.accessor((t) => t.name, {
      id: "name",
      header: () => (
        <div className="flex items-start">
          <p>Nombre del Equipo</p>
        </div>
      ),
      cell: ({ getValue, row }) => {
        const name = getValue();

        return (
          <div className="flex items-start">
            <Button
              variant="link"
              nativeButton={false}
              render={(props) => (
                <Link
                  {...props}
                  to="/dashboard/$orgslug/teams/$teamid"
                  params={{
                    teamid: row.original.id,
                    orgslug: orgSlug,
                  }}
                />
              )}
            >
              {name}
            </Button>
          </div>
        );
      },
    }),
    columnHelper.accessor((t) => t.description, {
      id: "description",
      header: "Descripción",
      cell: ({ getValue }) => {
        const description = getValue();

        if (!description) return <p>-</p>;

        const truncatedDescription =
          description.slice(0, 20) + (description.length > 20 ? "..." : "");

        return <p>{truncatedDescription}</p>;
      },
    }),
    columnHelper.display({
      id: "employees",
      header: "Número de Empleados",
      cell: () => {
        return <p>{20}</p>;
      },
    }),
    columnHelper.accessor((t) => t.permissions, {
      id: "permissions",
      header: "Permisos",
      cell: ({ getValue }) => {
        const permissions = getValue();

        return (
          <div>
            {permissions.slice(0, 3).map((permission) => (
              <div key={permission}>{translatePermission(permission).es}</div>
            ))}
            {permissions.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{permissions.length - 3} más
              </div>
            )}
          </div>
        );
      },
    }),

    columnHelper.accessor((t) => t.createdAt, {
      id: "created_at",
      header: "Fecha de creación",
      cell: ({ getValue }) => {
        const createdAt = getValue();

        return createdAt.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <TeamsTableActions team={row.original} orgSlug={orgSlug} />
      ),
    }),
  ];
}
