import { SaleCard } from "@/modules/commerce/presentation/components/sale-card";
import { SalesScreenSkeleton } from "@/modules/commerce/presentation/screens/sale.screen";
import { SalesListSection } from "@/modules/commerce/presentation/sections/sale-list.section";
import { MaterialIcons } from "@/modules/shared/components/icons";
import type { CustomerDetail } from "@fludge/client/commerce/domain/customer.repository";
import { useFindSales } from "@fludge/client/commerce/queries/use-find-sales";
import { Tabs } from "heroui-native/tabs";
import { Typography } from "heroui-native/text";
import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

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
          {sales.map((s) => (
            <SaleCard sale={s} key={s.id} />
          ))}
        </Tabs.Content>
        <Tabs.Content value="payments">
          <PaymentHistorySection />
        </Tabs.Content>
      </Tabs>
    </View>
  );
}
