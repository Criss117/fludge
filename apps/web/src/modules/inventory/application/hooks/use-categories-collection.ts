import { useVerifiedSession } from "@/integrations/auth/context";
import { categoryCollectionBuilder } from "../collections/categories.collection";

export function useCategoriesCollection() {
  const session = useVerifiedSession();

  return categoryCollectionBuilder(session.activeOrganization.id);
}
