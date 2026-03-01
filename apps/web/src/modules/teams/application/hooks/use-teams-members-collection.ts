import { useVerifiedSession } from "@/integrations/auth/context";
import { teamsMembersCollectionBuilder } from "@teams/application/collections/teams-members.collections";

export function useTeamsMembersCollection(activeOrganizationId?: string) {
  const session = useVerifiedSession();

  return teamsMembersCollectionBuilder(
    activeOrganizationId || session.activeOrganization.id,
  );
}
