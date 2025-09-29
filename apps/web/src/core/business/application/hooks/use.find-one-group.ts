import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findOneGroupAction } from "../actions/find-one-group.action";

export function findOneGroupQueryOptions(businessId: string, groupId: string) {
  return queryOptions({
    queryKey: ["business", businessId, "groups", groupId],
    queryFn: () => findOneGroupAction(businessId, groupId),
  });
}

export function useFindOneGroup(businessId: string, groupId: string) {
  const query = useSuspenseQuery(findOneGroupQueryOptions(businessId, groupId));

  if (!query.data.data) {
    throw new Error(query.data.error, {
      cause: query.data.statusCode,
    });
  }

  return {
    ...query,
    data: query.data.data,
  };
}
