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
    costPrice?: "asc" | "desc" | null;
    salePrice?: "asc" | "desc" | null;
    wholesalePrice?: "asc" | "desc" | null;
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
  const orderByCostPrice = filters.orderBy?.costPrice || null;
  const orderBySalePrice = filters.orderBy?.salePrice || null;
  const orderByWholesalePrice = filters.orderBy?.wholesalePrice || null;

  const anyOrderBy =
    !!orderByStock ||
    !!orderByCostPrice ||
    !!orderBySalePrice ||
    !!orderByWholesalePrice;

  const { data } = useLiveSuspenseQuery(() => {
    let query = new Query().from({ product: productsCollection });

    if (orderByCostPrice) {
      query = query.orderBy(
        ({ product }) => product.costPrice,
        orderByCostPrice,
      );
    }

    if (orderByStock) {
      query = query.orderBy(({ product }) => product.stock, orderByStock);
    }

    if (orderBySalePrice) {
      query = query.orderBy(
        ({ product }) => product.salePrice,
        orderBySalePrice,
      );
    }

    if (orderByWholesalePrice) {
      query = query.orderBy(
        ({ product }) => product.wholesalePrice,
        orderByWholesalePrice,
      );
    }

    if (!anyOrderBy)
      query = query.orderBy(({ product }) => product.createdAt, "desc");

    return query

      .where(({ product }) =>
        or(ilike(product.name, `%${name}%`), ilike(product.sku, `%${sku}%`)),
      )
      .limit(limit)
      .offset(offset);
  }, [
    limit,
    offset,
    name,
    sku,
    orderByStock,
    orderByCostPrice,
    orderBySalePrice,
    orderByWholesalePrice,
  ]);

  return data;
}
