import { Card } from "heroui-native/card";
import { Skeleton } from "heroui-native/skeleton";
import { SkeletonGroup } from "heroui-native/skeleton-group";
import { View } from "react-native";
import { SALES_CARD_HEIGHT } from "./sales-product-card";

export function SalesProductCardSkeleton() {
  return (
    <View className="rounded-3xl" style={{ width: "48%" }}>
      <Card
        className="h-full justify-between gap-y-3"
        style={{ height: SALES_CARD_HEIGHT }}
      >
        <Card.Header className="flex-row items-start">
          <View className="flex-1">
            <SkeletonGroup className="gap-y-1 py-0.5">
              <SkeletonGroup.Item className="h-6 w-4/5 rounded-full" />
              <SkeletonGroup.Item className="h-7 w-3/5 rounded-full" />
            </SkeletonGroup>
          </View>
          <Skeleton className="h-6 w-6 rounded-full" />
        </Card.Header>
        <Card.Body>
          <Skeleton className="h-5 w-2/5 rounded-full" />
        </Card.Body>
      </Card>
    </View>
  );
}
