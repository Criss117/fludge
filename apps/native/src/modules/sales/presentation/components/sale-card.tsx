import { MaterialIcons } from "@/modules/shared/components/icons";
import type { SaleDetail } from "@fludge/client/application/sales/domain/sale.repository";
import type { SaleStatusEnum } from "@fludge/utils/enums/db-enums";
import { formatPrice } from "@fludge/utils/currency";
import { cn } from "heroui-native";
import { Button } from "heroui-native/button";
import { Card } from "heroui-native/card";
import { Chip } from "heroui-native/chip";
import { Popover } from "heroui-native/popover";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Skeleton } from "heroui-native/skeleton";
import { SkeletonGroup } from "heroui-native/skeleton-group";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SaleReceiptDialog } from "./sale-receipt-dialog";

interface Props {
  sale: SaleDetail;
}

// Altura real de la card, usada en la card y en el getItemLayout de la lista
// para optimizar el render (mismo patrón que customer-card).
export const SALE_CARD_HEIGHT = 216;

const SaleStatusConfig = {
  open: {
    icon: "schedule",
    className: "border-amber-400 bg-amber-100",
    textColor: "text-amber-600",
    label: "screens.sales.status.open",
  },
  completed: {
    icon: "check-circle",
    className: "bg-success/20 border-success",
    textColor: "text-success",
    label: "screens.sales.status.completed",
  },
  cancelled: {
    icon: "cancel",
    className: "bg-danger/20 border-danger",
    textColor: "text-danger",
    label: "screens.sales.status.cancelled",
  },
} as const;

function SaleStatusChip({ status }: { status: SaleStatusEnum }) {
  const { t } = useTranslation();
  const config = SaleStatusConfig[status];

  return (
    <Chip className={cn("border", config.className)}>
      <MaterialIcons
        name={config.icon}
        size={14}
        className={config.textColor}
      />
      <Chip.Label className={config.textColor}>{t(config.label)}</Chip.Label>
    </Chip>
  );
}

export function SaleCard({ sale }: Props) {
  const { t } = useTranslation();
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const paymentIcon = sale.paymentType === "cash" ? "payments" : "credit-card";

  return (
    <>
      <Card
        className="justify-between gap-y-3"
        style={{ height: SALE_CARD_HEIGHT }}
      >
        <Card.Header className="flex-row items-start">
          <View className="flex-1">
            <Card.Title className="line-clamp-1">{sale.saleNumber}</Card.Title>
          </View>
          <View className="items-end gap-y-1">
            <Typography type="body-sm" color="muted">
              {sale.createdAt.toLocaleDateString()}
            </Typography>
            <SaleStatusChip status={sale.status} />
          </View>
        </Card.Header>

        <Card.Body className="gap-y-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-x-1.5">
              <MaterialIcons
                name={paymentIcon}
                size={18}
                className="text-muted"
              />
              <Typography>
                {t(`screens.sales.payment_type.${sale.paymentType}`)}
              </Typography>
            </View>
            <Typography className="font-bold">
              {formatPrice(sale.total)}
            </Typography>
          </View>

          <View className="flex-row items-center justify-between gap-x-2">
            <View className="flex-1 flex-row items-center gap-x-1.5">
              <MaterialIcons name="person" size={18} className="text-muted" />
              <Typography color="muted" className="flex-1" numberOfLines={1}>
                {sale.customerId ?? t("screens.sales.card.walk_in")}
              </Typography>
            </View>
            <View className="flex-row items-center gap-x-1.5">
              <MaterialIcons
                name="inventory-2"
                size={18}
                className="text-muted"
              />
              <Typography color="muted">
                {sale.items.length} {t("screens.sales.card.items")}
              </Typography>
            </View>
          </View>
        </Card.Body>

        <Card.Footer className="flex-row items-center gap-x-2">
          <Button
            size="sm"
            className="flex-1"
            onPress={() => setIsReceiptOpen(true)}
          >
            <Button.Label className="text-eclipse">
              {t("screens.sales.card.tirilla")}
            </Button.Label>
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Button.Label className="text-foreground">
              {t("screens.sales.card.detail")}
            </Button.Label>
          </Button>
          <Popover presentation="popover">
            <Popover.Trigger asChild>
              <PressableFeedback className="pl-1">
                <MaterialIcons
                  name="more-vert"
                  size={24}
                  className="text-foreground"
                />
              </PressableFeedback>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Overlay className="bg-default-soft" />
              <Popover.Content presentation="popover" width={120} />
            </Popover.Portal>
          </Popover>
        </Card.Footer>
      </Card>

      <SaleReceiptDialog
        sale={isReceiptOpen ? sale : null}
        onClose={() => setIsReceiptOpen(false)}
      />
    </>
  );
}

export function SaleCardSkeleton() {
  return (
    <Card
      className="justify-between gap-y-3"
      style={{ height: SALE_CARD_HEIGHT }}
    >
      <Card.Header className="flex-row items-start">
        <View className="flex-1 gap-y-1">
          <Skeleton className="h-6 w-2/5 rounded-full" />
        </View>
        <SkeletonGroup className="flex-col items-end gap-y-1">
          <SkeletonGroup.Item className="h-5 w-20 rounded-full" />
          <SkeletonGroup.Item className="h-6 w-24 rounded-full" />
        </SkeletonGroup>
      </Card.Header>

      <Card.Body>
        <SkeletonGroup className="gap-y-3">
          <SkeletonGroup.Item className="h-5 w-full rounded-full" />
          <SkeletonGroup.Item className="h-5 w-full rounded-full" />
        </SkeletonGroup>
      </Card.Body>

      <Card.Footer>
        <SkeletonGroup className="flex-row gap-x-2">
          <SkeletonGroup.Item className="h-9 flex-1 rounded-full" />
          <SkeletonGroup.Item className="h-9 flex-1 rounded-full" />
          <SkeletonGroup.Item className="h-9 w-9 rounded-full" />
        </SkeletonGroup>
      </Card.Footer>
    </Card>
  );
}
