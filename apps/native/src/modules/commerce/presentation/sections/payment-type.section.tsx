import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Card } from "heroui-native/card";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { cn } from "heroui-native";

interface Props {
  paymentType: "cash" | "credit";
  onPaymentTypeChange: (paymentType: "cash" | "credit") => void;
}

export function PaymentTypeSection({
  paymentType,
  onPaymentTypeChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className="gap-y-2">
      <Card.Header>
        <Card.Title>{t("screens.sales.payment_type.title")}</Card.Title>
      </Card.Header>
      <Card.Body>
        <View className="flex-row gap-x-2">
          <Button
            size="lg"
            className={cn(
              "flex-1",
              paymentType === "cash"
                ? "bg-foreground"
                : "border-muted border",
            )}
            onPress={() => onPaymentTypeChange("cash")}
          >
            <MaterialIcons
              name="payments"
              size={20}
              className={
                paymentType === "cash" ? "text-background" : "text-foreground"
              }
            />
            <Button.Label
              className={
                paymentType === "cash" ? "text-background" : "text-foreground"
              }
            >
              {t("screens.sales.payment_type.cash")}
            </Button.Label>
          </Button>

          <Button
            size="lg"
            className={cn(
              "flex-1",
              paymentType === "credit"
                ? "bg-foreground"
                : "border-muted border",
            )}
            onPress={() => onPaymentTypeChange("credit")}
          >
            <MaterialIcons
              name="credit-card"
              size={20}
              className={
                paymentType === "credit"
                  ? "text-background"
                  : "text-foreground"
              }
            />
            <Button.Label
              className={
                paymentType === "credit"
                  ? "text-background"
                  : "text-foreground"
              }
            >
              {t("screens.sales.payment_type.credit")}
            </Button.Label>
          </Button>
        </View>
      </Card.Body>
    </Card>
  );
}