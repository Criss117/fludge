import { MaterialIcons } from "@/modules/shared/components/icons";
import { StatusChip } from "@/modules/shared/components/status-chip";
import { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { View } from "react-native";

interface Props {
  product: ProductSummary;
}

export const CARD_HEIGHT = 152;

export function ProductCard({ product }: Props) {
  return (
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
  );
}
