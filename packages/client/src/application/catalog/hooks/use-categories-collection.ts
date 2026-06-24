import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useORPC } from "@fludge/client/providers/orpc.provider";
import { categoryCollectionBuilder } from "@fludge/client/application/catalog/collections/category.collection";

export function useCategoryCollection(organizationId: string) {
  const queryClient = useQueryClient();
  const { orpc } = useORPC();

  const categoryCollection = useMemo(
    () => categoryCollectionBuilder(organizationId, queryClient, orpc),
    [organizationId],
  );

  return {
    categoryCollection,
  };
}
