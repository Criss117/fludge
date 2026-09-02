import { MaterialIcons } from "@/modules/shared/components/icons";
import { StatusChip } from "@/modules/shared/components/status-chip";
import { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import { useRouter } from "expo-router";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Skeleton } from "heroui-native/skeleton";
import { SkeletonGroup } from "heroui-native/skeleton-group";
import { View } from "react-native";

interface Props {
  product: ProductSummary;
}

export const CARD_HEIGHT = 152;

export function ProductCard({ product }: Props) {
  const router = useRouter();

  return (
    <PressableFeedback className="rounded-3xl shadow">
      <Card className="justify-between gap-y-3" style={{ height: CARD_HEIGHT }}>
        <Card.Header className="flex-row items-start">
          <View className="flex-1">
            <Card.Title className="line-clamp-2">{product.name}</Card.Title>
            <View className="flex flex-row items-center gap-x-1">
              <MaterialIcons
                name="conveyor-belt"
                size={20}
                className="text-muted"
              />
              <Card.Description>
                {product.totalPresentations} Presentaciones
              </Card.Description>
            </View>
          </View>
          <StatusChip status={product.status} />
        </Card.Header>
        <Card.Body>
          <View className="flex flex-row items-center gap-x-2">
            <Chip>
              <Chip.Label>Stock: {product.stock}</Chip.Label>
            </Chip>

            {product.allowNegativeStock && (
              <Chip className="bg-foreground">
                <Chip.Label className="text-accent">
                  Permite Stock Negativo
                </Chip.Label>
              </Chip>
            )}
          </View>
        </Card.Body>
      </Card>
    </PressableFeedback>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="justify-between gap-y-3" style={{ height: CARD_HEIGHT }}>
      <Card.Header className="flex-row items-start">
        <View className="flex-1">
          <SkeletonGroup className="gap-y-1 py-0.5">
            <SkeletonGroup.Item className="h-6 w-4/6 rounded-full" />
            <SkeletonGroup.Item className="h-6 w-1/3 rounded-full" />
          </SkeletonGroup>
          <View className="flex flex-row items-center gap-x-1">
            <MaterialIcons
              name="conveyor-belt"
              size={20}
              className="text-muted"
            />
            <Skeleton className="h-4 w-1/2 rounded-full" />
          </View>
        </View>
        <Skeleton className="h-7 w-1/4 rounded-full" />
      </Card.Header>
      <Card.Body>
        <View className="flex flex-row items-center gap-x-2">
          <Skeleton className="h-7 w-1/4 rounded-full" />
        </View>
      </Card.Body>
    </Card>
  );
}
