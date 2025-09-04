import { Button } from "@/core/shared/components/ui/button";
import { Link } from "@tanstack/react-router";
import { GroupsTable } from "../components/groups-table";
import { usePermissions } from "@/core/auth/application/providers/permissions.provider";

interface Props {
  businessId: string;
  totalGroups: number;
}

export function GroupsHeaderSection({ totalGroups, businessId }: Props) {
  const { table } = GroupsTable.useGroupsTable();
  const { userHasPermissions } = usePermissions();

  const selectedRows = table.getSelectedRowModel().rows.length;
  const userCanDeleteGroups = userHasPermissions("groups:delete");
  const userCanCreateGroups = userHasPermissions("groups:create");

  return (
    <header className="flex justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          Listado de Grupos ({totalGroups}
          {selectedRows > 0 && `/${selectedRows}`})
        </h2>
        <p className="text-muted-foreground text-sm">
          Los grupos permiten organizar los permisos de los empleados.
        </p>
      </div>
      <div className="space-x-2">
        <Button
          variant="destructive"
          disabled={selectedRows === 0 || !userCanDeleteGroups}
        >
          Eliminar
        </Button>
        <Button disabled={!userCanCreateGroups} asChild={userCanCreateGroups}>
          <Link
            to="/business/$id/groups/create"
            params={{
              id: businessId,
            }}
            disabled={!userCanCreateGroups}
          >
            Crear Grupo
          </Link>
        </Button>
      </div>
    </header>
  );
}
