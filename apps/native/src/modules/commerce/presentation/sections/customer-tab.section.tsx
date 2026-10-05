import { SaleCard } from "@/modules/commerce/presentation/components/sale-card";
import { MaterialIcons } from "@/modules/shared/components/icons";
import type { CustomerDetail } from "@fludge/client/commerce/domain/entities";
import { useFindSales } from "@fludge/client/commerce/queries/use-find-sales";
import { Tabs } from "heroui-native/tabs";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { PaymentCard } from "../components/payment-card";

function PaymentHistorySection() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center py-8">
      <MaterialIcons name="history" size={48} className="text-muted" />
      <Typography color="muted" className="mt-2">
        {t("screens.customers.detail.no_payments")}
      </Typography>
    </View>
  );
}

export function CustomerTabsSection({
  customer,
}: {
  customer: CustomerDetail;
}) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("sales");
  const { data } = useFindSales({
    customerId: customer.id,
  });

  const sales = data.pages.flatMap((p) => p.items);

  return (
    <View className="flex-1 gap-y-3">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <Tabs.List className="w-full">
          <Tabs.Indicator />
          <Tabs.Trigger value="sales" className="w-1/2">
            <Tabs.Label>{t("screens.customers.detail.tab_sales")}</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="payments" className="w-1/2">
            <Tabs.Label>
              {t("screens.customers.detail.tab_payments")}
            </Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="sales">
          <View className="flex-1 gap-y-2">
            {sales.map((s) => (
              <SaleCard sale={s} key={s.id} />
            ))}
          </View>
        </Tabs.Content>
        <Tabs.Content value="payments">
          {customer.payments.length === 0 ? (
            <PaymentHistorySection />
          ) : (
            <View className="flex-1 gap-y-2">
              {customer.payments.map((p) => (
                <PaymentCard payment={p} key={p.id} />
              ))}
            </View>
          )}
        </Tabs.Content>
      </Tabs>
    </View>
  );
}
