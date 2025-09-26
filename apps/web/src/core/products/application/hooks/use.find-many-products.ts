import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findManyProductsAction } from "../actions/find-many-products.action";

interface Props {
  businessId: string;
}

export function findManyProductsQueryOptions({ businessId }: Props) {
  return queryOptions({
    queryKey: ["business", businessId, "products"],
    queryFn: async () => {
      const res = await findManyProductsAction({ businessId });

      if (res.error || !res.data) {
        throw new Error(res.error);
      }

      return res.data;
    },
  });
}

export function useFindManyProducts({ businessId }: Props) {
  return useSuspenseQuery(findManyProductsQueryOptions({ businessId }));
}
