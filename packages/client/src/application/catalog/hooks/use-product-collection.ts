import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useORPC } from "@fludge/client/providers/orpc.provider";
import { productCollectionBuilder } from "@fludge/client/application/catalog/collections/product.collection";

export function useProductCollection(organizationId: string) {
  const queryClient = useQueryClient();
  const { orpc } = useORPC();

  const productCollection = useMemo(
    () => productCollectionBuilder(organizationId, queryClient, orpc),
    [organizationId],
  );

  return {
    productCollection,
  };
}
