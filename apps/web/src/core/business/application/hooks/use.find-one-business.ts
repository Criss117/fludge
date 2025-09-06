import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findOneBusinessAction } from "../actions/find-one-business.action";

export function findOneBusinessQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["business", id],
    queryFn: () => findOneBusinessAction(id),
  });
}

export function useFindOneBusiness(id: string) {
  const query = useSuspenseQuery(findOneBusinessQueryOptions(id));

  if (!query.data.data || query.data.error) {
    throw new Error(query.data.error, {
      cause: query.data.statusCode,
    });
  }
  return {
    ...query,
    data: query.data.data,
  };
}
