import {
  ProductsScreen,
  ProductsScreenSkeleton,
} from "@/modules/catalog/presentation/screens/products.screen";
import { Suspense } from "react";

export default function CatalogProducts() {
  return (
    <Suspense fallback={<ProductsScreenSkeleton />}>
      <ProductsScreen />
    </Suspense>
  );
}
