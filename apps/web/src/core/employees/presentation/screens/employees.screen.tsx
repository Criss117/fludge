import { useFindOneBusiness } from "@/core/business/application/hooks/use.find-one-business";
import { EmployeesSummaryTable } from "../components/employees-summary-table";
import { EmployeesHeaderSection } from "../sections/employees-header.section";
import {
  PageHeader,
  PageHeaderEmployees,
  PageHeaderHome,
} from "@/core/shared/components/page-header-bread-crumb";
import { UserHasNoPermissionAlert } from "@/core/shared/components/unauthorized-alerts";

interface Props {
  businessId: string;
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

export function EmployeesScreen({ businessId }: Props) {
  const { data: business } = useFindOneBusiness(businessId);

  return (
    <section className="mx-2 space-y-4">
      <PageHeader>
        <PageHeaderHome businessId={businessId} />
        <PageHeaderEmployees businessId={businessId} isPage />
      </PageHeader>
      <EmployeesSummaryTable.Root
        data={business.employees}
        variant="detail"
        businessId={businessId}
      >
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
