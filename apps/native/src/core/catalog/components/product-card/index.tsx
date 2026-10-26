import { Host } from "@expo/ui";
import { formatCurrency } from "@fludge/utils/format-currency";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { MenuOptions } from "@/core/shared/components/menu-options";
import { Chip, StatusChip } from "@/core/shared/components/status-chip";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { ProductCardProps } from "./types";
import { generateChips, useProductCard } from "./use-product-card";

export function ProductCard({ product }: ProductCardProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { state } = useProductCard({ product });

  const chips = generateChips(product);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.onSecondary,
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.status}>
            <View style={styles.statusInfo}>
              <StatusChip status={product.status} />
              <ThemedText variant="muted" numberOfLines={1}>
                {product.slug}
              </ThemedText>
            </View>
            <View>
              <ThemedText numberOfLines={1} variant="h4">
                {product.name}
              </ThemedText>
              <ThemedText numberOfLines={1} variant="muted">
                {product.description}
              </ThemedText>
            </View>
          </View>
          <ScrollView
            style={{ flex: 1, overflow: "hidden" }}
            contentContainerStyle={styles.chips}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {chips.map((c) => (
              <Chip key={c.label.key} label={t(c.label.key, c.label.args)} icon={c.icon} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.presentationList}>
          {state.firtsPresentations.map((presentation, index) => (
            <Fragment key={presentation.id}>
              <View style={styles.presetationItem}>
                <View style={styles.presentationHeader}>
                  <View>
                    <ThemedText numberOfLines={1}>{presentation.name}</ThemedText>
                    <ThemedText variant="muted" numberOfLines={1}>
                      {presentation.barcode}
                    </ThemedText>
                  </View>
                  <Chip label={`x${presentation.conversionFactor}`} />
                </View>
                <View>
                  <ThemedText numberOfLines={1}>
                    {formatCurrency(presentation.priceSale)}
                  </ThemedText>
                </View>
              </View>

              {index + 1 < state.firtsPresentations.length && (
                <View style={[{ backgroundColor: colors.outline, flex: 1, height: 1 }]} />
              )}
            </Fragment>
          ))}
          {state.hasMorePresentations !== null && (
            <ThemedText variant="muted">
              {t("helpers.x_more", { count: state.hasMorePresentations })}
            </ThemedText>
          )}
        </View>
        <View style={styles.menuOptions}>
          <Host matchContents ignoreSafeArea="all">
            <MenuOptions items={state.menuOptions} />
          </Host>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SPACING.xl,
    position: "relative",
  },
  contentContainer: {
    padding: SPACING.md,
    rowGap: SPACING.md,
  },
  header: {
    rowGap: SPACING.sm,
  },
  status: {
    flex: 1,
  },
  statusInfo: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
  },
  presentationList: {
    paddingHorizontal: SPACING.sm,
    rowGap: SPACING.sm,
  },
  presetationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    rowGap: SPACING.sm,
  },
  presentationHeader: {
    flex: 1,
    flexDirection: "row",
    columnGap: SPACING.xs,
  },
  menuOptions: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
  },
  chips: {
    rowGap: SPACING.sm,
    flexDirection: "row",
    columnGap: SPACING.sm,
  },
});
