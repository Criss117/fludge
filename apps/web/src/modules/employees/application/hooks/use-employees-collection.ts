import { useVerifiedSession } from "@/modules/auth/application/hooks/use-session";
import { employeesCollectionBuilder } from "../collections/employees.collection";

export function useEmployeesCollection() {
  const { data: session } = useVerifiedSession();

  return employeesCollectionBuilder(session.activeOrganizationId);
}
