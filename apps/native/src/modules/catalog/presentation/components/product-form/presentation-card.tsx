import { MaterialIcons } from "@/modules/shared/components/icons";
import type { ProductFormSchema } from "@fludge/client/application/catalog/form/product-form";
import { formatCurrency } from "@fludge/utils/format-currency";
import { cn } from "heroui-native";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

type Presentation = ProductFormSchema["presentations"][number];

interface Props {
  presentation: Presentation;
  remove: (id: string) => void;
  restore: (id: string) => void;
  setSelectedPresentation: (presentation: Presentation) => void;
  markAsDeleted: (id: string) => void;
  action?: "create" | "update";
}

export function PresentationFormCard({
  presentation,
  remove,
  restore,
  setSelectedPresentation,
  markAsDeleted,
  action = "create",
}: Props) {
  const { t } = useTranslation();

  const presentationIsInActive = presentation.status === "inactive";

  if (presentationIsInActive && action === "create") return null;

  const onSelect = () => {
    if (presentationIsInActive) return;
    setSelectedPresentation(presentation);
  };

  const onDelete = () => {
    if (presentationIsInActive) return;

    if (action === "create") remove(presentation.id);

    markAsDeleted(presentation.id);
  };

  const onRestore = () => {
    if (!presentationIsInActive) return;
    restore(presentation.id);
  };

  return (
    <Card
      className={cn(
        "bg-default gap-y-2",
        presentationIsInActive && "opacity-50"
      )}
    >
      <Card.Header className="flex-1 flex-row items-start">
        <View className="flex-1">
          <Card.Title className="line-clamp-1">{presentation.name}</Card.Title>
          <Chip size="sm">
            <Chip.Label>Factor: x{presentation.conversionFactor}</Chip.Label>
          </Chip>
          <Card.Description className="line-clamp-2">
            {t("resources.presentations.barcode")}: {presentation.barcode}
          </Card.Description>
        </View>
        <View className="flex-row items-center">
          {!presentationIsInActive && (
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              isDisabled={presentationIsInActive}
              onPress={onSelect}
            >
              <MaterialIcons
                name="edit"
                size={20}
                className="text-foreground"
              />
            </Button>
          )}

          {!presentationIsInActive && (
            <Button
              size="sm"
              variant="ghost"
              isIconOnly
              isDisabled={presentationIsInActive}
              onPress={onDelete}
            >
              <MaterialIcons name="delete" size={20} className="text-danger" />
            </Button>
          )}
          {presentationIsInActive && (
            <Button size="sm" isIconOnly onPress={onRestore}>
              <MaterialIcons
                name="undo"
                size={20}
                className="text-foreground"
              />
            </Button>
          )}
        </View>
      </Card.Header>
      <Separator />
      <Card.Body>
        <View className="flex-1">
          <Typography type="body-sm" color="muted">
            {t("resources.presentations.price_sale")}
          </Typography>
          <Typography className="text-success font-semibold">
            {formatCurrency(presentation.priceSale)}
          </Typography>
        </View>
        <View className="flex-row">
          <View className="flex-1">
            <Typography type="body-sm" color="muted">
              {t("resources.presentations.price_purchase")}
            </Typography>
            <Typography>
              {formatCurrency(presentation.pricePurchase)}
            </Typography>
          </View>
          <View className="flex-1">
            <Typography type="body-sm" color="muted">
              {t("resources.presentations.price_wholesale")}
            </Typography>
            <Typography>
              {formatCurrency(presentation.priceWholesale)}
            </Typography>
          </View>
        </View>
      </Card.Body>
    </Card>
  );
}
