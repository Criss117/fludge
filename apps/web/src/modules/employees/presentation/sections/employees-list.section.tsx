import { useLiveSuspenseQuery } from "@tanstack/react-db";
import { useEmployeesCollection } from "@/modules/employees/application/hooks/use-employees-collection";

export function EmployeesListSection() {
  const employeesCollection = useEmployeesCollection();

  const { data } = useLiveSuspenseQuery((q) =>
    q.from({
      employees: employeesCollection,
    }),
  );

  return (
    <pre>
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
}
