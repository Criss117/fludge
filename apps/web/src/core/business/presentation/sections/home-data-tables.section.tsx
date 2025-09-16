import { EmployeesSummaryTable } from "@/core/employees/presentation/components/employees-summary-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/shared/components/ui/card";
import type { BusinessDetail } from "@repo/core/entities/business";

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
          <EmployeesSummaryTable.Root
            data={business.employees}
            businessId={business.id}
          >
            <EmployeesSummaryTable.Content>
              <EmployeesSummaryTable.Header />
              <EmployeesSummaryTable.Body />
            </EmployeesSummaryTable.Content>
          </EmployeesSummaryTable.Root>
        </CardContent>
      </Card>
    </section>
  );
}
