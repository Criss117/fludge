import { useVerifiedSession } from "@/integrations/auth/context";
import { teamsCollectionBuilder } from "../collections/teams.collections";

export function useTeamsCollection(activeOrganizationId?: string) {
  const session = useVerifiedSession();

  return teamsCollectionBuilder(
    activeOrganizationId || session.activeOrganization.id,
  );
}
