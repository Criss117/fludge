import { AssistChip, Column, ElevatedCard, Host, Row } from "@expo/ui/jetpack-compose";
import { paddingAll, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { MenuOptions } from "@/core/shared/components/menu-options";
import { StatusChip } from "@/core/shared/components/status-chip";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { ProductCardProps } from "./types";
import { generateChips, useProductCard } from "./use-product-card";

const CARD_HEIGHT = 224;

export function ProductCard({ product }: ProductCardProps) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { state } = useProductCard({ product });

  const chips = generateChips(product);

  return (
    <Host style={{ width: "100%", height: CARD_HEIGHT }}>
      <ElevatedCard
        colors={{
          containerColor: colors.onSecondary,
        }}
      >
        <Column modifiers={[paddingAll(SPACING.md)]}>
          <Row horizontalAlignment="center">
            <Column modifiers={[weight(1)]}>
              <ThemedNativeText variant="h5" numberOfLines={1}>
                {product.name}
              </ThemedNativeText>
              <ThemedNativeText variant="muted" numberOfLines={1}>
                {t("screens.catalog.products.total_presentations", {
                  quantity: product.presentations.length,
                })}
              </ThemedNativeText>
            </Column>
            <StatusChip status={product.status} />
          </Row>
          <Row verticalAlignment="bottom">
            <Column modifiers={[weight(1)]}>
              {chips.map((c) => (
                <AssistChip
                  key={c.label.key}
                  colors={{
                    containerColor: colors.surface,
                    trailingIconContentColor: colors.onSurface,
                  }}
                >
                  <AssistChip.LeadingIcon>
                    <Icon name={c.icon} size={SPACING.md} color={colors.onSurface} />
                  </AssistChip.LeadingIcon>
                  <AssistChip.Label>
                    <ThemedNativeText>{t(c.label.key, c.label.args)}</ThemedNativeText>
                  </AssistChip.Label>
                </AssistChip>
              ))}
            </Column>
            <MenuOptions items={state.menuOptions} />
          </Row>
        </Column>
      </ElevatedCard>
    </Host>
  );
}
