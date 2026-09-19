import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Card } from "heroui-native/card";
import { Tabs } from "heroui-native/tabs";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { CustomerSelectorBottomSheet } from "@/modules/customer/presentation/components/customer-selector-bottom-sheet";
import { CustomerSaleCard } from "@/modules/customer/presentation/components/customer-sale-card";
import type { CustomerSummary } from "@fludge/client/application/customer/domain/customer.repository";
import { Typography } from "heroui-native/text";

interface Props {
  selectedCustomer: CustomerSummary | null;
  onSelectCustomer: (customer: CustomerSummary | null) => void;
}

export function CustomerSelectorSection({
  selectedCustomer,
  onSelectCustomer,
}: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"walk-in" | "customer">("walk-in");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <Card className="gap-y-2">
      <Card.Header>
        <Card.Title>{t("screens.sales.customer_selector.title")}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "walk-in" | "customer")}
        >
          <Tabs.List className="flex-1">
            <Tabs.Indicator />
            <Tabs.Trigger value="walk-in" className="h-full flex-1">
              <Tabs.Label className="text-sm">
                {t("screens.sales.customer_selector.walk_in")}
              </Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="customer" className="h-full flex-1">
              <Tabs.Label className="text-sm">
                {t("screens.sales.customer_selector.customer")}
              </Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="walk-in" className="pt-3">
            <View className="items-center gap-y-1 py-4">
              <MaterialIcons
                name="person-outline"
                size={24}
                className="text-muted"
              />
              <Typography className="text-muted">
                {t("screens.sales.customer_selector.walk_in_hint")}
              </Typography>
            </View>
          </Tabs.Content>

          <Tabs.Content value="customer" className="pt-3">
            {selectedCustomer ? (
              <CustomerSaleCard
                customer={selectedCustomer}
                onDeselect={() => onSelectCustomer(null)}
              />
            ) : (
              <Button
                variant="outline"
                className="border-muted border-dashed"
                onPress={() => setIsSheetOpen(true)}
              >
                <MaterialIcons
                  name="person-add"
                  size={20}
                  className="text-muted"
                />
                <Button.Label className="text-muted">
                  {t("screens.sales.customer_selector.select_customer")}
                </Button.Label>
              </Button>
            )}
          </Tabs.Content>
        </Tabs>
      </Card.Body>

      <CustomerSelectorBottomSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSelect={(customer) => {
          onSelectCustomer(customer);
          setIsSheetOpen(false);
        }}
      />
    </Card>
  );
}
