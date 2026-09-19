import { MaterialIcons } from "@/modules/shared/components/icons";
import { StatusChip } from "@/modules/shared/components/status-chip";
import { useRouter } from "expo-router";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Skeleton } from "heroui-native/skeleton";
import { SkeletonGroup } from "heroui-native/skeleton-group";
import { Typography } from "heroui-native/text";
import { Button } from "heroui-native/button";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { CustomerSummary } from "@fludge/client/application/customer/domain/customer.repository";
import { cn } from "heroui-native";

interface Props {
  customer: CustomerSummary;
}

// Altura real de la card, medida en el layout. Usada en la card
// y en el getItemLayout de la lista para optimizar el render.
export const CARD_HEIGHT = 280;

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

function DebtProgress({ customer }: { customer: CustomerSummary }) {
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
    <Card className="bg-default gap-y-2">
      <Card.Body className="gap-y-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-x-1">
            <MaterialIcons
              name="credit-card"
              size={16}
              className="text-muted"
            />
            <Typography type="body-sm" color="muted">
              {t("screens.customers.card.debt")}
            </Typography>
          </View>
          <Typography type="body-sm" className={cn("font-semibold", textColor)}>
            {`${Math.round(percentage)}%`}
          </Typography>
        </View>

        <View className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
          <View
            className={cn("h-full rounded-full", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </View>
      </Card.Body>
      <Card.Footer>
        <Button size="sm" className="w-full">
          <MaterialIcons name="payments" size={18} className="text-eclipse" />
          <Button.Label className="text-eclipse">
            {t("screens.customers.card.pay")}
          </Button.Label>
        </Button>
      </Card.Footer>
    </Card>
  );
}

export function CustomerCard({ customer }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const identification = customer.documentNumber
    ? `${customer.documentType ?? ""} ${customer.documentNumber}`.trim()
    : "-";

  return (
    <PressableFeedback
      className="rounded-3xl shadow"
      onPress={() =>
        router.push({
          pathname: "/(private)/dashboard/customers/[customerid]",
          params: { customerid: customer.id },
        })
      }
    >
      <Card className="justify-between gap-y-3" style={{ height: CARD_HEIGHT }}>
        <Card.Header className="flex-row items-start">
          <View className="flex-1">
            <Card.Title className="line-clamp-1">{customer.name}</Card.Title>
            <View className="flex-row items-center gap-x-1">
              <MaterialIcons name="badge" size={16} className="text-muted" />
              <Card.Description>{identification}</Card.Description>
            </View>
          </View>
          <View className="flex-col items-end gap-y-1">
            <StatusChip status={customer.status} />
            <Typography type="body-sm" color="muted">
              {t("helpers.created_at")}{" "}
              {customer.createdAt.toLocaleDateString()}
            </Typography>
          </View>
        </Card.Header>

        <Card.Body>
          <View className="gap-y-1.5">
            <View className="flex-row items-center gap-x-2">
              <Chip size="sm">
                <MaterialIcons name="phone" size={14} className="text-muted" />
                <Chip.Label>
                  {t("screens.customers.card.phone")}: {customer.phone ?? "-"}
                </Chip.Label>
              </Chip>
            </View>
            <View className="flex-row items-center gap-x-2">
              <Chip size="sm">
                <MaterialIcons name="email" size={14} className="text-muted" />
                <Chip.Label>
                  {t("screens.customers.card.email")}: {customer.email ?? "-"}
                </Chip.Label>
              </Chip>
            </View>
          </View>
        </Card.Body>

        <Card.Footer>
          <DebtProgress customer={customer} />
        </Card.Footer>
      </Card>
    </PressableFeedback>
  );
}

export function CustomerCardSkeleton() {
  const { t } = useTranslation();

  return (
    <Card className="justify-between gap-y-3" style={{ height: CARD_HEIGHT }}>
      <Card.Header className="flex-row items-start">
        <View className="flex-1 gap-y-1">
          <Skeleton className="h-7 w-4/5 rounded-full" />
          <View className="flex-row items-center gap-x-1">
            <MaterialIcons name="badge" size={16} className="text-muted" />
            <Skeleton className="h-5 w-3/5 rounded-full" />
          </View>
        </View>
        <SkeletonGroup className="flex-col items-end gap-y-1">
          <SkeletonGroup.Item className="h-7 w-20 rounded-full" />
          <SkeletonGroup.Item className="h-5 w-24 rounded-full" />
        </SkeletonGroup>
      </Card.Header>

      <Card.Body>
        <SkeletonGroup className="gap-y-1.5">
          <SkeletonGroup.Item className="h-7 w-4/6 rounded-full" />
          <SkeletonGroup.Item className="h-7 w-5/6 rounded-full" />
        </SkeletonGroup>
      </Card.Body>

      <Card.Footer>
        <Card className="bg-default gap-y-2">
          <Card.Body className="gap-y-2">
            <SkeletonGroup className="gap-y-2">
              <SkeletonGroup.Item className="h-5 w-1/3 rounded-full" />
              <SkeletonGroup.Item className="h-2.5 w-full rounded-full" />
              <SkeletonGroup.Item className="h-5 w-2/5 rounded-full" />
            </SkeletonGroup>
          </Card.Body>
        </Card>
      </Card.Footer>
    </Card>
  );
}
