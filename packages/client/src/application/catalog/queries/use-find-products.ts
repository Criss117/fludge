import {
  eq,
  ilike,
  toArray,
  useLiveInfiniteQuery,
  useLiveSuspenseQuery,
} from "@tanstack/react-db";
import { useProductsCollection } from "@fludge/client/application/catalog/collections/products.collection";
import { SearchBlob } from "@fludge/utils/search-blob";
import { useProductsPresentationsCollection } from "../collections/product-presentations.container";

interface Filters {
  query: string;
}

export function useFindProducts(filters?: Filters) {
  const { productCollection, activeOrganization } = useProductsCollection();

  const normalizedQuery = SearchBlob.normalize(filters?.query ?? "");

  return useLiveInfiniteQuery(
    (q) => {
      return q
        .from({
          pc: productCollection,
        })
        .select(({ pc }) => ({
          id: pc.id,
          name: pc.name,
          searchBlob: pc.searchBlob,
          description: pc.description,
          createdAt: pc.createdAt,
          status: pc.status,
          stock: pc.stock,
          allowNegativeStock: pc.allowNegativeStock,
          totalPresentations: pc.totalPresentations,
        }))
        .where(({ pc }) => ilike(pc.searchBlob, "%" + normalizedQuery + "%"))
        .orderBy(({ pc }) => pc.createdAt, "desc");
    },
    {
      initialPageParam: 0,
      pageSize: 10,
      queryKey: [
        "organization",
        activeOrganization.id,
        "products",
        normalizedQuery,
      ],
    },
  );
}

export function useFindOneProduct(productId: string) {
  const { productCollection, activeOrganization } = useProductsCollection();
  const { productPresentationsCollection } =
    useProductsPresentationsCollection();

  return useLiveSuspenseQuery({
    queryKey: ["organization", activeOrganization.id, "products", productId],
    query: (q) =>
      q
        .from({
          pc: productCollection,
        })
        .select(({ pc }) => ({
          ...pc,
          presentations: toArray(
            q
              .from({
                ppc: productPresentationsCollection,
              })
              .select(({ ppc }) => ({
                ...ppc,
              }))
              .where(({ ppc }) => eq(ppc.productId, pc.id))
              .orderBy(({ ppc }) => ppc.createdAt, "desc"),
          ),
        }))
        .where(({ pc }) => eq(pc.id, productId))
        .findOne(),
  });
}

export type ProductSummary = ReturnType<typeof useFindProducts>["data"][number];
export type ProductDetail = NonNullable<
  ReturnType<typeof useFindOneProduct>["data"]
>;
