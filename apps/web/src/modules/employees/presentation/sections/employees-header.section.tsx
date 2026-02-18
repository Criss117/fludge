import { useLiveSuspenseQuery } from "@tanstack/react-db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { CreateEmployee } from "@/modules/employees/presentation/components/create-employee";
import { useEmployeesQueries } from "@/modules/employees/application/hooks/use-employees-queries";

export function EmployeesHeaderSection() {
  const { totalEmployees } = useEmployeesQueries();
  const { data } = useLiveSuspenseQuery(() => totalEmployees());

  const total = data?.total || 0;

  return (
    <header>
      <Card className="flex flex-row justify-between items-start">
        <CardHeader className="flex-1">
          <CardTitle className="text-2xl">Listado de Empleados</CardTitle>
          <CardDescription>
            Administra el acceso y permisos de los empleados.
          </CardDescription>
          <CardDescription>
            {total} empleados en tu organización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateEmployee />
        </CardContent>
      </Card>
    </header>
  );
}
