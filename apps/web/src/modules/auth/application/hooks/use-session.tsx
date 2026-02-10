import { orpc } from "@/integrations/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useVerifiedSession() {
  const { data, ...rest } = useSuspenseQuery(
    orpc.auth.getSession.queryOptions(),
  );

  if (!data) {
    throw new Error("Session not found");
  }

  const activeOrganizationId = data.activeOrganizationId;

  if (!activeOrganizationId) {
    throw new Error("Active organization not found");
  }

  return {
    data: {
      ...data,
      activeOrganizationId,
    },
    ...rest,
  };
}
