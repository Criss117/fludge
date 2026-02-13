import { EmployeesHeaderSection } from "../sections/employees-header.section";
import { EmployeesListSection } from "../sections/employees-list.section";

export function EmployeesScreen() {
  return (
    <div className="px-5 mt-4 space-y-5">
      <EmployeesHeaderSection />
      <EmployeesListSection />
    </div>
  );
}
