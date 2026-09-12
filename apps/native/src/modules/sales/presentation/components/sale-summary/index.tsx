import { MaterialIcons } from "@/modules/shared/components/icons";
import { useTickets } from "@fludge/client/providers/tickets.provider";
import { formatPrice } from "@fludge/utils/currency";
import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SalesSummaryContent } from "./content";

export function SalesSummary() {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { t } = useTranslation();
  const { activeTicket } = useTickets();
  const total = activeTicket.total;

  const openSummary = () => setIsSummaryOpen(true);
  const closeSummary = () => setIsSummaryOpen(false);

  return (
    <View className="bg-surface pb-safe-offset-4 flex-row items-center justify-between gap-x-3 px-4 pt-3">
      <View className="flex-1">
        <Typography color="muted">
          {t("screens.sales.summary.title")}
        </Typography>
        <Typography className="font-bold">{formatPrice(total)}</Typography>
      </View>
      <Button onPress={openSummary}>
        <MaterialIcons
          name="shopping-cart"
          size={20}
          className="text-eclipse"
        />
        <Button.Label className="text-eclipse">
          {t("screens.sales.summary.title")}
        </Button.Label>
      </Button>
      <SalesSummaryContent isOpen={isSummaryOpen} onOpenChange={closeSummary} />
    </View>
  );
}
