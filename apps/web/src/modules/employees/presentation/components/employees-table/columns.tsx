import { Link } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreVerticalIcon } from "lucide-react";
import type { Employee } from "@/modules/employees/application/collections/employees.collection";
import { LinkButton } from "@/modules/shared/components/link-button";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/modules/shared/components/ui/avatar";
import { toAvatarFallback } from "@fludge/utils/helpers";
import { Button } from "@/modules/shared/components/ui/button";
import { Badge } from "@/modules/shared/components/ui/badge";

const columnHelper = createColumnHelper<Employee>();

export function employeesTableColumns(orgSlug: string) {
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
    columnHelper.accessor((t) => t.user.name, {
      id: "name",
      header: "Nombre",
      cell: (info) => (
        <div className="flex items-center gap-x-5 justify-center">
          <Avatar>
            <AvatarFallback>
              {toAvatarFallback(info.row.original.user.name)}
            </AvatarFallback>
          </Avatar>
          <LinkButton
            to="/dashboard/$orgslug/employees/$employeeid"
            variant="link"
            params={{
              orgslug: orgSlug,
              employeeid: info.row.id,
            }}
          >
            {info.getValue()}
          </LinkButton>
        </div>
      ),
    }),
    columnHelper.accessor((t) => t.user.email, {
      header: "Correo electrónico",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((t) => t.user.phone, {
      header: "Telefono",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((t) => t.createdAt, {
      header: "Ingresado el",
      cell: (info) =>
        info.getValue().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
    }),
    columnHelper.accessor((t) => t.teams, {
      id: "teams",
      header: "Equipos",
      cell: (info) => (
        <div className="flex flex-col items-center gap-y-1">
          {info.getValue().length === 0 && (
            <p className="text-muted-foreground text-sm">Sin Equipos</p>
          )}
          {info.getValue().map((team) => (
            <Link
              key={team.id}
              to="/dashboard/$orgslug/teams/$teamid"
              params={{
                orgslug: orgSlug,
                teamid: team.id,
              }}
            >
              <Badge variant="outline">{team.name}</Badge>
            </Link>
          ))}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost">
          <MoreVerticalIcon />
        </Button>
      ),
    }),
  ];
}
