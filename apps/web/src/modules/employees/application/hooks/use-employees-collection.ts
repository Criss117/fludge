import { useVerifiedSession } from "@/integrations/auth/context";
import { employeesCollectionBuilder } from "../collections/employees.collection";

export function useEmployeesCollection() {
  const session = useVerifiedSession();

  return employeesCollectionBuilder(session.activeOrganizationId);
}
