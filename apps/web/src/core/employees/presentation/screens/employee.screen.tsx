import { useFindOneEmployee } from "@/core/employees/application/hooks/use.find-one-employee";
import { EmployeeSectionHeader } from "../sections/employee-header.section";
import { EmployeeDataTableSection } from "../sections/employee-data-table.section";
import {
  PageHeader,
  PageHeaderEmployee,
  PageHeaderEmployees,
  PageHeaderHome,
} from "@/core/shared/components/page-header-bread-crumb";
import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";

interface Props {
  businessId: string;
  employeeId: string;
}

export function WithOutPermissions({ businessId }: Props) {
  return (
    <section className="mx-2 space-y-4">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderEmployees businessId={businessId} isPage />
      </PageHeader>
      <UserHasNoPermissionAlert />
    </section>
  );
}

export function EmployeeScreen({ businessId, employeeId }: Props) {
  const { data: employee } = useFindOneEmployee({ businessId, employeeId });

  return (
    <section className="mx-2 space-y-4">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderEmployees businessId={businessId} />
        <PageHeaderEmployee
          employeeId={employeeId}
          employeeName={`${employee.firstName} ${employee.lastName}`}
          businessId={businessId}
          isPage
        />
      </PageHeader>
      <div className="space-y-8">
        <EmployeeSectionHeader employee={employee} />
        <EmployeeDataTableSection employee={employee} />
      </div>
    </section>
  );
}
