import { useVerifiedSession } from "@/modules/auth/application/hooks/use-session";
import { teamsCollectionBuilder } from "@/modules/teams/application/collections/teams.collection";

export function useTeamsCollection(activeOrganizationId?: string) {
  const { data: session } = useVerifiedSession();

  return teamsCollectionBuilder(
    activeOrganizationId || session.activeOrganizationId,
  );
}
