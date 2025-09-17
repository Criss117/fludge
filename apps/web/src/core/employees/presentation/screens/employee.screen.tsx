import { PageHeader } from "@/core/shared/components/page-header";
import { useFindOneEmployee } from "@/core/employees/application/hooks/use.find-one-employee";
import { EmployeeSectionHeader } from "../sections/employee-header.section";
import { EmployeeDataTableSection } from "../sections/employee-data-table.section";

interface Props {
  businessId: string;
  employeeId: string;
}

export function EmployeeScreen({ businessId, employeeId }: Props) {
  const { data: employee } = useFindOneEmployee({ businessId, employeeId });

  return (
    <section className="mx-2 space-y-4">
      <PageHeader title={`${employee.firstName} ${employee.lastName}`} />
      <div className="space-y-8">
        <EmployeeSectionHeader employee={employee} />
        <EmployeeDataTableSection employee={employee} />
      </div>
    </section>
  );
}
