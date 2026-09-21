import { Suspense } from "react";
import { View } from "react-native";
import { SaleCardSkeleton } from "../components/sale-card";
import { SalesListSection } from "../sections/sale-list.section";

export function SalesScreen() {
  return (
    <View className="relative flex-1 gap-y-3 px-3 pt-2">
      <Suspense fallback={<SalesScreenSkeleton />}>
        <SalesListSection />
      </Suspense>
    </View>
  );
}

export function SalesScreenSkeleton() {
  return (
    <View className="gap-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <SaleCardSkeleton key={i} />
      ))}
    </View>
  );
}
