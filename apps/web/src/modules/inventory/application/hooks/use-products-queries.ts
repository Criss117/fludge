import {
  count,
  ilike,
  or,
  Query,
  useLiveSuspenseQuery,
} from "@tanstack/react-db";

import { useProductsCollection } from "./use-products-collection";

interface Filters {
  limit?: number;
  page?: number;
  name?: string;
  sku?: string;
  orderBy?: {
    stock?: "asc" | "desc" | null;
  };
}

export function useCountAllProducts() {
  const productsCollection = useProductsCollection();

  const { data } = useLiveSuspenseQuery((q) =>
    q
      .from({ products: productsCollection })
      .select(({ products }) => ({
        total: count(products.id),
      }))
      .findOne(),
  );
  return data?.total || 0;
}

export function useFindManyProducts(filters: Filters) {
  const productsCollection = useProductsCollection();

  const limit = filters.limit || 50;
  const offset = (filters.page || 0) * limit;
  const name = filters.name || "";
  const sku = filters.sku || "";
  const orderByStock = filters.orderBy?.stock || null;

  const { data } = useLiveSuspenseQuery(() => {
    let query = new Query()
      .from({ product: productsCollection })
      .orderBy(({ product }) => product.createdAt, "desc")
      .orderBy(({ product }) => product.stock, "desc")
      .where(({ product }) =>
        or(ilike(product.name, `%${name}%`), ilike(product.sku, `%${sku}%`)),
      )
      .limit(limit)
      .offset(offset);

    return query;

    return query
      .where(({ product }) =>
        or(ilike(product.name, `%${name}%`), ilike(product.sku, `%${sku}%`)),
      )
      .limit(limit)
      .offset(offset);
  }, [limit, offset, name, sku, orderByStock]);

  return data;
}
