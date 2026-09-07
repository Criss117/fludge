import { MaterialIcons } from "@/modules/shared/components/icons";
import type { ProductFormSchema } from "@fludge/client/application/catalog/form/product-form";
import { cn } from "heroui-native";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Typography } from "heroui-native/text";
import { View } from "react-native";

type Presentation = ProductFormSchema["presentations"][number];

interface Props {
  presentation: Presentation;
  remove: (id: string) => void;
  restore: (id: string) => void;
  setSelectedPresentation: (presentation: Presentation) => void;
  showDelete?: boolean;
}

export function PresentationFormCard({
  presentation,
  showDelete,
  remove,
  restore,
  setSelectedPresentation,
}: Props) {
  if (presentation.delete && !showDelete) return null;

  const onSelect = () => {
    if (presentation.delete) return;
    setSelectedPresentation(presentation);
  };

  const onDelete = () => {
    if (presentation.delete) return;
    remove(presentation.id);
  };

  return (
    <Card
      className={cn(
        "bg-default flex-row items-start gap-y-2",
        presentation.delete && "opacity-50"
      )}
    >
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
          isDisabled={presentation.delete}
          onPress={onSelect}
        >
          <MaterialIcons name="edit" size={20} className="text-foreground" />
        </Button>

        <Button
          variant="ghost"
          isIconOnly
          isDisabled={presentation.delete}
          onPress={onDelete}
        >
          <MaterialIcons name="delete" size={20} className="text-danger" />
        </Button>
      </Card.Body>
    </Card>
  );
}
