import { MoreVerticalIcon } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import type { Employee } from "@/modules/employees/application/collections/employees.collection";
import { LinkButton } from "@/modules/shared/components/link-button";
import { Checkbox } from "@/modules/shared/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/modules/shared/components/ui/avatar";
import { toAvatarFallback } from "@fludge/utils/helpers";
import { Button } from "@/modules/shared/components/ui/button";

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
    columnHelper.accessor((t) => t.createdAt, {
      header: "Ingresado el",
      cell: (info) =>
        info.getValue().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
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
