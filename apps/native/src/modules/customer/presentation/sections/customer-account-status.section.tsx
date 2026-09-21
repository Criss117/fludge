import { MaterialIcons } from "@/modules/shared/components/icons";
import type { CustomerDetail } from "@fludge/client/application/customer/domain/customer.repository";
import { formatCurrency } from "@fludge/utils/format-currency";
import { cn } from "heroui-native";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

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

export function AccountStatusSection({
  customer,
}: {
  customer: CustomerDetail;
}) {
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

  const bgColor =
    color === "danger"
      ? "bg-danger/10"
      : color === "warning"
        ? "bg-warning/10"
        : "bg-success/10";

  return (
    <View className="gap-y-3">
      <Typography type="h6">
        {t("screens.customers.detail.account_status")}
      </Typography>

      <View className="flex-row gap-x-3">
        <Card className={cn("flex-1", bgColor)}>
          <Card.Body className="gap-y-1">
            <Typography type="body-sm" color="muted">
              {t("screens.customers.card.debt")}
            </Typography>
            <Typography type="h5" className={cn("font-bold", textColor)}>
              {formatCurrency(customer.balance)}
            </Typography>
          </Card.Body>
        </Card>

        <Card className="flex-1">
          <Card.Body className="gap-y-1">
            <Typography type="body-sm" color="muted">
              {t("screens.customers.card.credit_limit")}
            </Typography>
            <Typography type="h5" className="font-bold">
              {formatCurrency(customer.creditLimit)}
            </Typography>
          </Card.Body>
        </Card>
      </View>

      <Card className="gap-y-2">
        <Card.Body className="gap-y-2">
          <View className="flex-row items-center justify-between">
            <Typography type="body-sm" color="muted">
              {t("screens.customers.detail.usage")}
            </Typography>
            <Typography
              type="body-sm"
              className={cn("font-semibold", textColor)}
            >
              {`${Math.round(percentage)}%`}
            </Typography>
          </View>

          <View className="bg-muted h-3 w-full overflow-hidden rounded-full">
            <View
              className={cn("h-full rounded-full", barColor)}
              style={{ width: `${percentage}%` }}
            />
          </View>
        </Card.Body>
        <Card.Footer>
          <Button size="sm" className="w-full" variant="outline">
            <MaterialIcons
              name="payments"
              size={18}
              className="text-foreground"
            />
            <Button.Label>
              {t("screens.customers.detail.register_payment")}
            </Button.Label>
          </Button>
        </Card.Footer>
      </Card>
    </View>
  );
}
