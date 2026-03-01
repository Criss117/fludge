import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";

import { useCountTotalEmployees } from "@employees/application/hooks/use-employees-queries";
import { CreateEmployee } from "@employees/presentation/components/create-employee";

export function EmployeesHeaderSection() {
  const total = useCountTotalEmployees();

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
