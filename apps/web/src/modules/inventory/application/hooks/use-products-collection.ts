import { useVerifiedSession } from "@/integrations/auth/context";
import { productCollectionBuilder } from "../collections/products.collection";

export function useProductsCollection() {
  const { activeOrganizationId } = useVerifiedSession();

  return productCollectionBuilder(activeOrganizationId);
}
