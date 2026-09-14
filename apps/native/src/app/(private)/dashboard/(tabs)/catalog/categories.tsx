import {
  CategoriesScreen,
  CategoriesScreenSkeleton,
} from "@/modules/catalog/presentation/screens/categories.screen";
import { Suspense } from "react";

export default function CatalogCategories() {
  return (
    <Suspense fallback={<CategoriesScreenSkeleton />}>
      <CategoriesScreen />
    </Suspense>
  );
}
