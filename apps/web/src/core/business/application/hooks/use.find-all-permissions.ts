import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findAllPermissionsAction } from "../actions/find-all-permissions.action";

export const findAllPermissionsQueryOptions = queryOptions({
  queryKey: ["all-permissions"],
  queryFn: () => findAllPermissionsAction(),
});

export function useFindAllPermissions() {
  const query = useSuspenseQuery(findAllPermissionsQueryOptions);

  if (!query.data.data || query.data.error) {
    throw new Error(query.data.message, {
      cause: query.data.statusCode,
    });
  }

  return {
    ...query,
    data: query.data.data,
  };
}
