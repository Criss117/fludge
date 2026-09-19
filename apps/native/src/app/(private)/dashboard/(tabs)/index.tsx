import {
  SalesScreen,
  SalesScreenSkeleton,
} from "@/modules/sales/presentation/screens/sale.screen";
import { Suspense } from "react";

export default function DashboardSales() {
  return (
    <Suspense fallback={<SalesScreenSkeleton />}>
      <SalesScreen />;
    </Suspense>
  );
}
