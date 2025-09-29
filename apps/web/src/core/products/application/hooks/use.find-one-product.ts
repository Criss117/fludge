import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findOneProductAction } from "../actions/find-one-product.action";

interface Props {
  businessId: string;
  productId: string;
}

export function findOneProductQueryOptions({ businessId, productId }: Props) {
  return queryOptions({
    queryKey: ["business", businessId, "products", productId],
    queryFn: async () => {
      const res = await findOneProductAction({
        businessId,
        productId,
      });

      if (res.error || !res.data) {
        throw new Error(res.message, {
          cause: res.message,
        });
      }

      return res.data;
    },
  });
}

export function useFindOneProduct(props: Props) {
  return useSuspenseQuery(findOneProductQueryOptions(props));
}
