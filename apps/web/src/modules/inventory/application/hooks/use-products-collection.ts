import { useVerifiedSession } from "@/integrations/auth/context";
import { productCollectionBuilder } from "../collections/products.collection";

export function useProductsCollection() {
  const session = useVerifiedSession();

  return productCollectionBuilder(session.activeOrganization.id);
}
