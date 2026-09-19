import { MaterialIcons } from "@/modules/shared/components/icons";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Typography } from "heroui-native/text";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { cn } from "heroui-native";
import { formatCurrency } from "@fludge/utils/format-currency";
import type { CustomerSummary } from "@fludge/client/application/customer/domain/customer.repository";

interface Props {
  customer: CustomerSummary;
  onDeselect: () => void;
}

function getDebtLevel(balance: number, creditLimit: number) {
  const percentage =
    creditLimit > 0
      ? Math.min(100, (balance / creditLimit) * 100)
      : balance > 0
        ? 100
        : 0;

  if (percentage >= 75) return { percentage, color: "danger" } as const;

  if (percentage > 50) return { percentage, color: "warning" } as const;

  return { percentage, color: "success" } as const;
}

export function CustomerSaleCard({ customer, onDeselect }: Props) {
  const { t } = useTranslation();
  const { percentage, color } = getDebtLevel(
    customer.balance,
    customer.creditLimit
  );

  const barColor =
    color === "danger"
      ? "bg-danger"
      : color === "warning"
        ? "bg-warning"
        : "bg-success";

  const textColor =
    color === "danger"
      ? "text-danger"
      : color === "warning"
        ? "text-warning"
        : "text-success";

  return (
    <View className="relative">
      <Card className="gap-y-3">
        <Card.Header className="flex-row items-start">
          <View className="flex-1">
            <Card.Title className="line-clamp-1">{customer.name}</Card.Title>
          </View>
        </Card.Header>
        <Card.Body className="gap-y-3">
          <View className="flex-row justify-between">
            <Typography type="body-sm" color="muted">
              {t("screens.customers.card.debt")}
            </Typography>
            <Typography type="body-sm" className="font-semibold">
              {formatCurrency(customer.balance)}
            </Typography>
          </View>
          <View className="flex-row justify-between">
            <Typography type="body-sm" color="muted">
              {t("screens.customers.card.credit_limit")}
            </Typography>
            <Typography type="body-sm" className="font-semibold">
              {formatCurrency(customer.creditLimit)}
            </Typography>
          </View>
          <View className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
            <View
              className={cn("h-full rounded-full", barColor)}
              style={{ width: `${percentage}%` }}
            />
          </View>
        </Card.Body>
      </Card>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2"
        onPress={onDeselect}
        accessibilityLabel={t("screens.customers.card.deselect")}
      >
        <MaterialIcons name="close" size={18} className="text-muted" />
      </Button>
    </View>
  );
}