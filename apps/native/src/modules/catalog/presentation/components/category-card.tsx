import { CategorySummary } from "@fludge/client/application/catalog/queries/use-find-categories";
import { StatusChip } from "@/modules/shared/components/status-chip";
import { Card } from "heroui-native/card";
import { SkeletonGroup } from "heroui-native/skeleton-group";
import { View } from "react-native";

export const CARD_HEIGHT = 120;

interface Props {
  category: CategorySummary;
}

export function CategoryCard({ category }: Props) {
  return (
    <Card className="justify-between gap-y-3" style={{ height: CARD_HEIGHT }}>
      <Card.Header className="flex-row items-start">
        <View className="flex-1">
          <Card.Title className="line-clamp-2">{category.name}</Card.Title>
          {category.description && (
            <Card.Description className="line-clamp-2">
              {category.description}
            </Card.Description>
          )}
        </View>
        <StatusChip status={category.status} />
      </Card.Header>
    </Card>
  );
}

export function CategoryCardSkeleton() {
  return (
    <Card className="justify-between gap-y-3" style={{ height: CARD_HEIGHT }}>
      <SkeletonGroup className="gap-y-1 py-0.5">
        <Card.Header className="flex-row items-start">
          <View className="flex-1 gap-y-1">
            <SkeletonGroup.Item className="h-6 w-4/6 rounded-full" />
            <SkeletonGroup.Item className="h-4 w-5/6 rounded-full" />
          </View>
          <SkeletonGroup.Item className="h-7 w-1/4 rounded-full" />
        </Card.Header>
      </SkeletonGroup>
    </Card>
  );
}
