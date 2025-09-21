import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findOneCategoryAction } from "../actions/find-one-category.action";

export function findOneCategoryQueryOptions(
  businessId: string,
  categoryId: string
) {
  return queryOptions({
    queryKey: ["business", businessId, "categories", categoryId],
    queryFn: () => findOneCategoryAction(businessId, categoryId),
  });
}

export function useFindOneCategory(businessId: string, categoryId: string) {
  const query = useSuspenseQuery(
    findOneCategoryQueryOptions(businessId, categoryId)
  );

  if (!query.data.data) {
    throw new Error("No se pudo obtener la categoría");
  }

  return {
    ...query,
    data: query.data.data,
  };
}
