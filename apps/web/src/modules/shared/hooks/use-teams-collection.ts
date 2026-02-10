import { useVerifiedSession } from "@/modules/auth/application/hooks/use-session";
import { teamsCollection } from "@/modules/teams/application/collections/teams.collection";

export function useTeamsCollection(activeOrganizationId?: string) {
  const { data: session } = useVerifiedSession();

  return teamsCollection(activeOrganizationId || session.activeOrganizationId);
}
