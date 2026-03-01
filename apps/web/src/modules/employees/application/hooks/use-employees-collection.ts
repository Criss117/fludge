import { useVerifiedSession } from "@/integrations/auth/context";
import { employeesCollectionBuilder } from "@employees/application/collections/employees.collection";

export function useEmployeesCollection() {
  const session = useVerifiedSession();

  return employeesCollectionBuilder(session.activeOrganization.id);
}
