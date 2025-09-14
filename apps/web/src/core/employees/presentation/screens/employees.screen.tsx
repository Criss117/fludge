import { useFindOneBusiness } from "@/core/business/application/hooks/use.find-one-business";
import { PageHeader } from "@/core/shared/components/page-header";
import { EmployeesSummaryTable } from "../components/employees-summary-table";
import { EmployeesHeaderSection } from "../sections/employees-header.section";

interface Props {
  businessId: string;
}

export function EmployeesScreen({ businessId }: Props) {
  const { data: business } = useFindOneBusiness(businessId);

  return (
    <section className="mx-2 space-y-4">
      <EmployeesSummaryTable.Root data={business.employees} variant="detail">
        <PageHeader title="Empleados" />
        <div className="mx-4">
          <EmployeesHeaderSection
            totalEmployees={business.employees.length}
            businessId={businessId}
          />
        </div>
        <div className="mx-4">
          <EmployeesSummaryTable.Content>
            <EmployeesSummaryTable.Header />
            <EmployeesSummaryTable.Body />
          </EmployeesSummaryTable.Content>
        </div>
      </EmployeesSummaryTable.Root>
    </section>
  );
}
