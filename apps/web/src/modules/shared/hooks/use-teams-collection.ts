import { useVerifiedSession } from "@/integrations/auth/context";
import { teamsCollectionBuilder } from "@/modules/teams/application/collections/teams.collection";

export function useTeamsCollection(activeOrganizationId?: string) {
  const session = useVerifiedSession();

  return teamsCollectionBuilder(
    activeOrganizationId || session.activeOrganizationId,
  );
}
