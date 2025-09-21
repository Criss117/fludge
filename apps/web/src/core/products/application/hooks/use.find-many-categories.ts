import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findManyCategoriesAction } from "../actions/find-many-categories.action";

export function findManyCategoriesQueryOptions(businessId: string) {
  return queryOptions({
    queryKey: ["business", businessId, "categories"],
    queryFn: () => findManyCategoriesAction(businessId),
  });
}

export function useFindManyCategories(businessId: string) {
  const query = useSuspenseQuery(findManyCategoriesQueryOptions(businessId));

  if (!query.data.data) {
    throw new Error("No se pudieron obtener las categorías");
  }

  return {
    ...query,
    data: query.data.data,
  };
}
