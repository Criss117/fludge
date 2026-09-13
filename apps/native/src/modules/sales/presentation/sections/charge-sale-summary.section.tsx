import { MaterialIcons } from "@/modules/shared/components/icons";
import type { Ticket } from "@fludge/client/application/sales/store/tickets.store/data";
import { formatPrice } from "@fludge/utils/currency";
import { Card } from "heroui-native/card";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  ticket: Ticket & {
    total: number;
  };
}

// Alturas fijas conocidas de antemano (ajustalas a tu diseño real)
const ITEM_ROW_HEIGHT = 100; // alto de cada fila de producto
const SEPARATOR_HEIGHT = 1; // alto del <Separator />
const BODY_VERTICAL_PADDING = 16; // padding total (top+bottom) de Card.Body
const FOOTER_HEIGHT = 56; // alto fijo del Card.Footer (py-4 + contenido)

export function ChargeSaleSummarySection({ ticket }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const items = useMemo(() => Object.values(ticket.items), [ticket.items]);

  const contentHeight = useMemo(() => {
    const rowsHeight = items.length * (ITEM_ROW_HEIGHT + SEPARATOR_HEIGHT);
    return rowsHeight + BODY_VERTICAL_PADDING + FOOTER_HEIGHT;
  }, [items.length]);

  const sharedHeight = useSharedValue(contentHeight);

  useEffect(() => {
    sharedHeight.value = contentHeight;
  }, [contentHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(isOpen ? sharedHeight.value : 0, { duration: 250 }),
    overflow: "hidden",
  }));

  const iconStype = useAnimatedStyle(() => ({
    transform: [
      { rotate: withTiming(isOpen ? "-90deg" : "90deg", { duration: 250 }) },
    ],
  }));

  return (
    <Card>
      <PressableFeedback onPress={() => setIsOpen((prev) => !prev)}>
        <Card.Header className="flex-row justify-between">
          <View className="flex-row items-start gap-x-2">
            <View className="bg-accent/20 rounded-xl p-2">
              <MaterialIcons
                name="payments"
                size={24}
                className="text-foreground"
              />
            </View>
            <View>
              <Card.Title>{t("helpers.summary")}</Card.Title>
              <View className="flex-row items-center gap-x-1">
                <Card.Description>{t("helpers.see_details")}</Card.Description>
                <Animated.View style={iconStype}>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    className="text-muted"
                  />
                </Animated.View>
              </View>
            </View>
          </View>
          <View className="items-end">
            <Typography type="body-sm" color="muted">
              {t("helpers.total")}
            </Typography>
            <Typography type="h5">{formatPrice(ticket.total)}</Typography>
          </View>
        </Card.Header>
      </PressableFeedback>
      <Separator />

      <Animated.View style={animatedStyle}>
        <Card.Body className="pt-4">
          {items.map((item) => {
            const [productName, presentationName] = item.name.split(":");

            return (
              <View
                key={item.id}
                style={{ height: ITEM_ROW_HEIGHT }}
                className="border-muted justify-between border-b-[0.2px] border-dashed"
              >
                <View>
                  <Typography className="line-clamp-1">
                    {productName}
                  </Typography>
                  <Typography
                    className="line-clamp-1"
                    color="muted"
                    type="body-sm"
                  >
                    {presentationName}
                  </Typography>
                </View>
                <View className="flex-row justify-between">
                  <Typography>
                    {item.quantity} x{formatPrice(item.priceSale)}
                  </Typography>
                  <Typography type="h6">
                    {formatPrice(item.priceSale * item.quantity)}
                  </Typography>
                </View>
              </View>
            );
          })}
        </Card.Body>
        <Card.Footer
          className="flex-row items-center justify-between"
          style={{ height: FOOTER_HEIGHT }}
        >
          <Typography type="h5">{t("helpers.total")}</Typography>
          <Typography type="h3">{formatPrice(ticket.total)}</Typography>
        </Card.Footer>
      </Animated.View>
    </Card>
  );
}
