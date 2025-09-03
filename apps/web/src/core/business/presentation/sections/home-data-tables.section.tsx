import { EmployeesSummaryTable } from "@/core/employees/presentation/components/employees-summary-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import type { BusinessDetail } from "@repo/core/entities/business";
import { GroupsTable } from "../components/groups-table";

interface Props {
  business: BusinessDetail;
}

export function HomeDataTablesSection({ business }: Props) {
  return (
    <section className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Lista de empleados</CardTitle>
          <CardDescription>
            Lista de todos los empleados del negocio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeesSummaryTable.Root data={business.employees}>
            <EmployeesSummaryTable.Header />
            <EmployeesSummaryTable.Body />
          </EmployeesSummaryTable.Root>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Lista de grupos</CardTitle>
          <CardDescription>
            Lista de todos los grupos del negocio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GroupsTable.Root data={business.groups}>
            <GroupsTable.Content>
              <GroupsTable.Header />
              <GroupsTable.Body />
            </GroupsTable.Content>
          </GroupsTable.Root>
        </CardContent>
      </Card>
    </section>
  );
}
