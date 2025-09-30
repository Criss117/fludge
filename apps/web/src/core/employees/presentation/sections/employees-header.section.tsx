import { usePermissions } from "@/core/auth/application/providers/permissions.provider";
import { Button } from "@/core/shared/components/ui/button";
import { Link } from "@tanstack/react-router";
import { EmployeesSummaryTable } from "../components/employees-summary-table/index";

interface Props {
  totalEmployees: number;
  businessId: string;
}

export function EmployeesHeaderSection({ totalEmployees, businessId }: Props) {
  const { userHasPermissions } = usePermissions();
  const { table } = EmployeesSummaryTable.useEmployeesTable();

  const selectedRows = table.getSelectedRowModel().rows.length;

  const userCanDeleteEmployees = userHasPermissions("users:delete");
  const userCanCreateEmployees = userHasPermissions("users:create");
  return (
    <header className="flex justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          Listado de Emplados ({totalEmployees}
          {selectedRows > 0 && `/${selectedRows}`})
        </h2>
      </div>
      <div className="space-x-2">
        {userCanDeleteEmployees && (
          <Button variant="destructive">Eliminar</Button>
        )}
        {userCanCreateEmployees && (
          <Button asChild>
            <Link
              to="/business/$id/employees/create"
              params={{
                id: businessId,
              }}
            >
              Crear Empleado
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
