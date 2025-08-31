import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findOneBusinessAction } from "../actions/find-one-business.action";
// import type { BusinessDetail } from "@repo/core/entities/business";

// type Options = {
//   onSuccess?: (data: BusinessDetail) => void;
//   onError?: () => void;
// };

export const findOneBusinessQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["business", { id }],
    queryFn: () => findOneBusinessAction(id),
  });

export function useFindOneBusiness(id: string) {
  const query = useSuspenseQuery(findOneBusinessQueryOptions(id));

  return {
    ...query,
    data: query.data.data!,
  };
}
