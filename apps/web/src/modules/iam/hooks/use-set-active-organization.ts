import { authClient } from "@/integrations/auth";
import { useORPC } from "@fludge/client/providers/orpc.provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSetActiveOrganization() {
  const { orpc } = useORPC();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["organizations", "set-active"],
    mutationFn: async (org: { id: string; slug: string }) => {
      await authClient.organization.setActive({
        organizationId: org.id,
        organizationSlug: org.slug,
      });

      await queryClient.prefetchQuery(
        orpc.organizations.queries.findActive.queryOptions(),
      );

      await queryClient.prefetchQuery(
        orpc.auth.queries.getSession.queryOptions(),
      );
    },
    onSuccess: () => {},
  });
}
