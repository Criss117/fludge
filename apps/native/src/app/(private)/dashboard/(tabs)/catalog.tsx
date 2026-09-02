import {
  CatalogScreen,
  CatalogScreenSkeleton,
} from "@/modules/catalog/presentation/screens/catalog.screen";
import { Suspense } from "react";

export default function DashboardCatalog() {
  return (
    <Suspense fallback={<CatalogScreenSkeleton />}>
      <CatalogScreen />
    </Suspense>
  );
}
