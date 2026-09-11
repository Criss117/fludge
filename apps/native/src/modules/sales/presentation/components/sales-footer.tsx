import { MaterialIcons } from "@/modules/shared/components/icons";
import { useTickets } from "@fludge/client/providers/tickets.provider";
import { formatPrice } from "@fludge/utils/currency";
import { Button } from "heroui-native/button";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface SalesFooterProps {
  onOpenSummary: () => void;
}

export function SalesFooter({ onOpenSummary }: SalesFooterProps) {
  const { t } = useTranslation();
  const { selectedTicket } = useTickets();
  const total = selectedTicket?.total ?? 0;

  return (
    <View className="flex-row items-center gap-x-3 bg-surface px-4 pb-safe-offset-4 pt-3">
      <View className="flex-1">
        <Typography color="muted">{t("screens.sales.summary.total")}</Typography>
        <Typography className="font-bold">{formatPrice(total)}</Typography>
      </View>
      <Button onPress={onOpenSummary}>
        <MaterialIcons name="shopping-cart" size={20} className="text-eclipse" />
        <Button.Label className="text-eclipse">
          {t("screens.sales.summary.title")}
        </Button.Label>
      </Button>
    </View>
  );
}
