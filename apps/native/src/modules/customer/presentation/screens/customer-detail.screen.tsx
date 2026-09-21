import type { CustomerDetail } from "@fludge/client/application/customer/domain/customer.repository";
import { Card } from "heroui-native/card";
import { Skeleton } from "heroui-native/skeleton";
import { ScrollView, View } from "react-native";
import { CustomerInfoSection } from "../sections/customer-general-info.section";
import { AccountStatusSection } from "../sections/customer-account-status.section";
import { SalesListSectionSkeleton } from "@/modules/sales/presentation/sections/sale-list.section";
import { CustomerTabsSection } from "../sections/customer-tab.section";

export function CustomerDetailScreen({
  customer,
}: {
  customer: CustomerDetail;
}) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-y-4 px-3 pt-2 pb-8"
      showsVerticalScrollIndicator={false}
    >
      <CustomerInfoSection customer={customer} />
      <AccountStatusSection customer={customer} />
      <CustomerTabsSection customer={customer} />
    </ScrollView>
  );
}

export function CustomerDetailSkeleton() {
  return (
    <View className="flex-1 gap-y-4 px-3 pt-2">
      <Card className="gap-y-4">
        <Card.Header className="flex-row items-center gap-x-3">
          <Skeleton className="size-14 rounded-full" />
          <View className="flex-1 gap-y-2">
            <Skeleton className="h-6 w-3/5 rounded-full" />
            <Skeleton className="h-4 w-2/5 rounded-full" />
          </View>
        </Card.Header>
        <Card.Body className="gap-y-3">
          <Skeleton className="h-5 w-full rounded-full" />
          <Skeleton className="h-5 w-full rounded-full" />
          <Skeleton className="h-5 w-full rounded-full" />
        </Card.Body>
      </Card>

      <View className="gap-y-3">
        <Skeleton className="h-6 w-2/5 rounded-full" />
        <View className="flex-row gap-x-3">
          <Skeleton className="h-20 flex-1 rounded-2xl" />
          <Skeleton className="h-20 flex-1 rounded-2xl" />
        </View>
        <Skeleton className="h-24 w-full rounded-2xl" />
      </View>

      <SalesListSectionSkeleton />
    </View>
  );
}
