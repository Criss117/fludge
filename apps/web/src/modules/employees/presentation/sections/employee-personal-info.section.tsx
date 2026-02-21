import type { Employee } from "@/modules/employees/application/collections/employees.collection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { Separator } from "@/modules/shared/components/ui/separator";
import { User } from "lucide-react";

interface Props {
  employee: Employee;
}

export function EmployeePersonalInfoSection({ employee }: Props) {
  return (
    <div className="flex justify-between gap-x-5">
      <Card className="flex-1">
        <CardHeader>
          <div className="flex gap-x-2 items-center">
            <div className="p-2 rounded-md bg-primary/20">
              <User size={28} />
            </div>
            <div>
              <CardTitle>Detalles Personal</CardTitle>
              <CardDescription>
                Resume de los datos del empleado
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3 grid grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">Nombre completo</p>
            <p className="text-base font-semibold">{employee.user.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Correo de contacto</p>
            <p className="text-base font-semibold">{employee.user.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Número de teléfono</p>
            <p className="text-base font-semibold">{employee.user.phone}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Dirección</p>
            <p className="text-base font-semibold">{employee.user.address}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
