import { Calendar, Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { Avatar, AvatarFallback } from "@/modules/shared/components/ui/avatar";
import { toAvatarFallback } from "@fludge/utils/helpers";
import { Button } from "@/modules/shared/components/ui/button";
import type { Employee } from "@/modules/employees/application/collections/employees.collection";

interface Props {
  employee: Employee;
}

export function EmployeeHeaderSection({ employee }: Props) {
  return (
    <Card className="flex justify-between flex-row">
      <CardHeader className="flex gap-x-2 flex-1">
        <Avatar size="lg">
          <AvatarFallback>
            {toAvatarFallback(employee.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold">
            {employee.user.name}
          </CardTitle>
          <CardDescription>ID: {employee.id}</CardDescription>
          <CardDescription className="flex gap-x-0.5 items-center">
            <Calendar size={16} />
            <span>
              Se unio el{" "}
              {employee.createdAt.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Button>
          <Pencil />
          Actualizar
        </Button>
      </CardContent>
    </Card>
  );
}
