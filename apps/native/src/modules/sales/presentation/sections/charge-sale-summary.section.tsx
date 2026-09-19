import { MaterialIcons } from "@/modules/shared/components/icons";
import type { Ticket } from "@fludge/client/application/sales/domain/local-ticket.repository";
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

// Receipt-style constants
const RECEIPT_FONT_SIZE = 13;
const ITEM_ROW_HEIGHT = 72;
const PRESENTATION_ROW_HEIGHT = 28;
const SEPARATOR_HEIGHT = 1;
const BODY_VERTICAL_PADDING = 16;
const FOOTER_HEIGHT = 56;

export function ChargeSaleSummarySection({ ticket }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const contentHeight = useMemo(() => {
    let height = BODY_VERTICAL_PADDING + FOOTER_HEIGHT;

    for (const product of ticket.products) {
      height += ITEM_ROW_HEIGHT;
      height += product.presentations.length * PRESENTATION_ROW_HEIGHT;
      height += SEPARATOR_HEIGHT;
    }

    return height;
  }, [ticket.products]);

  const sharedHeight = useSharedValue(contentHeight);

  useEffect(() => {
    sharedHeight.value = contentHeight;
  }, [contentHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(isOpen ? sharedHeight.value : 0, { duration: 250 }),
    overflow: "hidden",
  }));

  const iconStyle = useAnimatedStyle(() => ({
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
                <Animated.View style={iconStyle}>
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
          {ticket.products.map((product) => (
            <View
              key={product.id}
              className="border-muted border-b-[0.5px] border-dashed py-2"
            >
              {/* Product name */}
              <Typography
                className="font-semibold"
                style={{ fontSize: RECEIPT_FONT_SIZE }}
              >
                {product.name}
              </Typography>

              {/* Presentations sub-listing */}
              {product.presentations.map((presentation) => (
                <View
                  key={presentation.id}
                  className="flex-row justify-between pl-4"
                  style={{ height: PRESENTATION_ROW_HEIGHT }}
                >
                  <View className="flex-1 flex-row items-center">
                    <Typography
                      color="muted"
                      className="flex-1"
                      style={{ fontSize: RECEIPT_FONT_SIZE - 1 }}
                    >
                      {presentation.name}
                    </Typography>
                    <Typography
                      color="muted"
                      style={{ fontSize: RECEIPT_FONT_SIZE - 1 }}
                    >
                      x{presentation.quantity}
                    </Typography>
                  </View>
                  <Typography
                    className="text-right"
                    style={{ fontSize: RECEIPT_FONT_SIZE - 1 }}
                  >
                    {formatPrice(
                      presentation.priceSale * presentation.quantity
                    )}
                  </Typography>
                </View>
              ))}

              {/* Product subtotal */}
              <View className="flex-row justify-between pt-1">
                <Typography
                  color="muted"
                  style={{ fontSize: RECEIPT_FONT_SIZE - 2 }}
                >
                  {product.presentations.reduce(
                    (sum, p) => sum + p.quantity,
                    0
                  )}{" "}
                  {t("helpers.items", "items")}
                </Typography>
                <Typography
                  className="font-semibold"
                  style={{ fontSize: RECEIPT_FONT_SIZE }}
                >
                  {formatPrice(
                    product.presentations.reduce(
                      (sum, p) => sum + p.priceSale * p.quantity,
                      0
                    )
                  )}
                </Typography>
              </View>
            </View>
          ))}
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
