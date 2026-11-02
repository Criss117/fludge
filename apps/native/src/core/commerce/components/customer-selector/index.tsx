import { Host } from "@expo/ui";
import type { CustomerSummary } from "@fludge/client/commerce/domain/entities";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/core/shared/components/icon";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { CustomerSaleCard } from "../customer-sale-card";
import { CustomerSelectorSheet } from "./customer-selector-sheet";

export type CustomerTab = "walk-in" | "customer";

interface CustomerSelectorProps {
  selectedCustomer: CustomerSummary | null;
  onSelectCustomer: (customer: CustomerSummary | null) => void;
  tab: "walk-in" | "customer";
  onTabChange: (tab: "walk-in" | "customer") => void;
}

const TABS: CustomerTab[] = ["walk-in", "customer"];

export function CustomerSelectorSection({
  selectedCustomer,
  onSelectCustomer,
  tab,
  onTabChange,
}: CustomerSelectorProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleDeselect = useCallback(() => onSelectCustomer(null), [onSelectCustomer]);
  const openSheet = useCallback(() => setIsSheetOpen(true), []);

  if (selectedCustomer) {
    return (
      <View style={styles.container}>
        <CustomerSaleCard customer={selectedCustomer} onDeselect={handleDeselect} />
      </View>
    );
  }

  const tabLabels: Record<CustomerTab, string> = {
    "walk-in": t("screens.charge.sections.customer_selector.walk_in"),
    customer: t("screens.charge.sections.customer_selector.customer"),
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.onSurface }]}>
        {t("screens.charge.sections.customer_selector.title")}
      </Text>
      <View style={styles.content}>
        <View style={styles.tabs} accessibilityRole="tablist">
          {TABS.map((key) => {
            const selected = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => onTabChange(key)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: selected ? colors.primary : colors.surfaceContainerHigh,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[styles.label, { color: selected ? colors.onPrimary : colors.onSurface }]}
                >
                  {tabLabels[key]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "walk-in" ? (
          <View style={styles.hint}>
            <Host matchContents>
              <Icon name="person" size={24} color={colors.outline} />
            </Host>
            <Text style={[styles.hintText, { color: colors.outline }]}>
              {t("screens.charge.sections.customer_selector.walk_in_hint")}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={openSheet}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              styles.selectButton,
              {
                backgroundColor: colors.surfaceContainerHigh,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Host matchContents>
              <Icon name="person-add" size={20} color={colors.onSurface} />
            </Host>
            <Text style={[styles.label, { color: colors.onSurface }]}>
              {t("screens.charge.sections.customer_selector.select_customer")}
            </Text>
          </Pressable>
        )}
      </View>

      <CustomerSelectorSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSelect={(customer) => {
          onSelectCustomer(customer);
          setIsSheetOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    width: "100%",
    gap: SPACING.md,
  },
  tabs: {
    flexDirection: "row",
    gap: SPACING.md,
    width: "100%",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectButton: {
    flex: 0,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  hint: {
    width: "100%",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  hintText: {
    fontSize: 13,
    textAlign: "center",
  },
});
