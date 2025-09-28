import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { findManyProductsAction } from "../actions/find-many-products.action";

interface Props {
  businessId: string;
  limit?: number;
  page?: number;
}

export function findManyProductsQueryOptions({
  businessId,
  limit,
  page,
}: Props) {
  return infiniteQueryOptions({
    queryKey: ["products", businessId, "products"],
    queryFn: async ({ pageParam }) => {
      // await sleep(2000);
      const res = await findManyProductsAction({
        businessId,
        limit: pageParam.limit,
        page: pageParam.page,
      });

      if (res.error || !res.data) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }

      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return null;

      return {
        page: lastPage.page + 1,
        limit: lastPage.limit,
      };
    },
    getPreviousPageParam: (lastPage) => {
      if (lastPage.page === 0) return null;

      return {
        page: lastPage.page - 1,
        limit: lastPage.limit,
      };
    },
    initialPageParam: {
      limit,
      page,
    },
  });
}

export function useFindManyProducts({ businessId, limit, page }: Props) {
  return useSuspenseInfiniteQuery(
    findManyProductsQueryOptions({ businessId, limit, page })
  );
}
