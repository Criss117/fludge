import { useCategoryCollection } from "@fludge/client/application/catalog/hooks/use-categories-collection";
import { useLiveSuspenseQuery } from "@tanstack/react-db";

export function useFindCategoriesCollection(organizationId: string) {
  const { categoryCollection } = useCategoryCollection(organizationId);

  return useLiveSuspenseQuery((q) => q.from({ q: categoryCollection }));
}
