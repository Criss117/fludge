import { useVerifiedSession } from "@/modules/auth/application/hooks/use-session";
import { useEmployeesCollection } from "../../application/hooks/use-employees-collection";
import { count, useLiveSuspenseQuery } from "@tanstack/react-db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";

export function EmployeesHeaderSection() {
  const { data: session } = useVerifiedSession();
  const employeesCollection = useEmployeesCollection();
  const { data } = useLiveSuspenseQuery((q) =>
    q.from({ teams: employeesCollection }).select(({ teams }) => ({
      total: count(teams.id),
    })),
  );

  const total = data.at(0)?.total || 0;

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
        <CardContent></CardContent>
      </Card>
    </header>
  );
}
