import { MaterialIcons } from "@/modules/shared/components/icons";
import type { ProductFormSchema } from "@fludge/client/application/catalog/form/product-form";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Typography } from "heroui-native/text";
import { View } from "react-native";

type Presentation = ProductFormSchema["presentations"][number];

interface Props {
  presentation: Presentation;
  remove: (id: string) => void;
  setSelectedPresentation: (presentation: Presentation) => void;
}

export function PresentationCard({
  presentation,
  remove,
  setSelectedPresentation,
}: Props) {
  return (
    <Card className="bg-default flex-row items-start gap-y-2">
      <Card.Header className="flex-1">
        <View className="flex flex-row items-center gap-x-2">
          <Card.Title className="line-clamp-1">{presentation.name}</Card.Title>
          <Chip size="sm">
            <Chip.Label>x{presentation.conversionFactor}</Chip.Label>
          </Chip>
        </View>
        <View className="flex-row items-center gap-x-2">
          <Typography type="body-sm" color="muted">
            ${presentation.priceSale}
          </Typography>
          <Card.Description>{presentation.barcode}</Card.Description>
        </View>
      </Card.Header>
      <Card.Body className="flex-row">
        <Button
          variant="ghost"
          isIconOnly
          onPress={() => {
            setSelectedPresentation(presentation);
          }}
        >
          <MaterialIcons name="edit" size={20} className="text-foreground" />
        </Button>

        <Button
          variant="ghost"
          isIconOnly
          onPress={() => {
            remove(presentation.id);
          }}
        >
          <MaterialIcons name="delete" size={20} className="text-danger" />
        </Button>
      </Card.Body>
    </Card>
  );
}
