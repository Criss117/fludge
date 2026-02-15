import { EmployeesHeaderSection } from "../sections/employees-header.section";
import { EmployeesListSection } from "../sections/employees-list.section";

interface Props {
  orgSlug: string;
}

export function EmployeesScreen({ orgSlug }: Props) {
  return (
    <div className="px-5 mt-4 space-y-5">
      <EmployeesHeaderSection />
      <EmployeesListSection orgSlug={orgSlug} />
    </div>
  );
}
