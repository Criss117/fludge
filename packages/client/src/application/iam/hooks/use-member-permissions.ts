import { useORPC } from "@fludge/client/providers/orpc.provider";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Permission } from "@fludge/utils/permissions/data";

export function useMemberPermissions() {
  const { orpc } = useORPC();
  const { data } = useSuspenseQuery(orpc.members.queries.me.queryOptions());

  const { role, permissions } = data;

  const can = (permission: Permission): boolean =>
    role === "owner" || permissions.includes(permission);

  return { can, role, permissions };
}