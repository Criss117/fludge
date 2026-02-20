import type { Employee } from "@/modules/employees/application/collections/employees.collection";
import { EmployeeHeaderSection } from "../sections/employee-header.section";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/shared/components/ui/tabs";
import { Card } from "@/modules/shared/components/ui/card";

interface Props {
  employee: Employee;
}

export function EmployeeScreen({ employee }: Props) {
  return (
    <div className="px-5 mt-4 space-y-5">
      <EmployeeHeaderSection employee={employee} />

      <Tabs defaultValue="information" className="space-y-3">
        <TabsList variant="line" className="w-1/2">
          <TabsTrigger value="information">Información</TabsTrigger>
          <TabsTrigger value="permissions">Equipos y permisios</TabsTrigger>
        </TabsList>

        <TabsContent value="information">
          <Card></Card>
        </TabsContent>

        <TabsContent value="permissions"></TabsContent>
      </Tabs>
    </div>
  );
}
