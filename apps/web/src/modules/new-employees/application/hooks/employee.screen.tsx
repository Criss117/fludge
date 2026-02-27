import type { Employee } from "@/modules/employees/application/collections/employees.collection";
import { EmployeeHeaderSection } from "../sections/employee-header.section";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/shared/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { EmployeePersonalInfoSection } from "../sections/employee-personal-info.section";
import { EmployeeTeamsSection } from "../sections/employee-teams.section";
import { FiltersProvider } from "@/modules/shared/store/teams-filters.store";

interface Props {
  employee: Employee;
  orgSlug: string;
}

export function EmployeeScreen({ employee, orgSlug }: Props) {
  return (
    <div className="px-5 mt-4 space-y-5">
      <EmployeeHeaderSection employee={employee} />

      <Tabs defaultValue="teams" className="space-y-3">
        <TabsList variant="line" className="w-2/3">
          <TabsTrigger value="teams">Equipos y permisios</TabsTrigger>
          <TabsTrigger value="information">Información</TabsTrigger>
        </TabsList>

        <TabsContent value="information" className="grid grid-cols-3 gap-x-6">
          <div className="col-span-2">
            <EmployeePersonalInfoSection employee={employee} />
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Informacion de acceso y seguridad</CardTitle>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <FiltersProvider>
            <EmployeeTeamsSection employee={employee} orgSlug={orgSlug} />
          </FiltersProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
}
