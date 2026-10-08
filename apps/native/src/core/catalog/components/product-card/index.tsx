import { Icon, type IconName } from "@/core/shared/components/icon";
import { MenuOptions } from "@/core/shared/components/menu-options";
import { StatusChip } from "@/core/shared/components/status-chip";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import { AssistChip, Card, Column, Host, Row } from "@expo/ui/jetpack-compose";
import { paddingAll, weight } from "@expo/ui/jetpack-compose/modifiers";
import type { ProductSummary } from "@fludge/client/catalog/domain/entities";
import { TranslationKey } from "@fludge/i18n/index";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

interface Props {
  product: ProductSummary;
}

type Chip = {
  label: {
    key: TranslationKey;
    args?: Record<string, unknown>;
  };
  icon: IconName;
};

function generateChips(product: ProductSummary): Chip[] {
  return [
    {
      label: {
        key: "screens.catalog.products.stock",
        args: { quantity: product.stock },
      },
      icon: "conveyor-belt",
    },
    {
      label: {
        key: "screens.catalog.products.min_stock",
        args: { quantity: product.stock },
      },
      icon: "conveyor-belt",
    },
    {
      label: {
        key: product.allowNegativeStock
          ? "screens.catalog.products.allow_negative_stock"
          : "screens.catalog.products.not_allow_negative_stock",
      },
      icon: "do-not-disturb-on",
    },
  ];
}

const CARD_HEIGHT = 224;

export function ProductCard({ product }: Props) {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const router = useRouter();

  const chips = generateChips(product);

  return (
    <Host style={{ width: "100%", height: CARD_HEIGHT }}>
      <Card
        colors={{
          containerColor: colors.onSecondary,
        }}
      >
        <Column modifiers={[paddingAll(SPACING.md)]}>
          <Row horizontalAlignment="center">
            <Column modifiers={[weight(1)]}>
              <ThemedNativeText variant="h5" maxLines={1}>
                {product.name}
              </ThemedNativeText>
              <ThemedNativeText variant="muted" maxLines={1}>
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
                    <Icon
                      name={c.icon}
                      size={SPACING.md}
                      color={colors.onSurface}
                    />
                  </AssistChip.LeadingIcon>
                  <AssistChip.Label>
                    <ThemedNativeText>
                      {t(c.label.key, c.label.args)}
                    </ThemedNativeText>
                  </AssistChip.Label>
                </AssistChip>
              ))}
            </Column>
            <MenuOptions
              items={[
                {
                  label: "helpers.navigation.see_details",
                  action: () => {
                    router.push({
                      pathname: "/dashboard/products/[productid]",
                      params: {
                        productid: product.id,
                      },
                    });
                  },
                  icon: "visibility",
                },
                {
                  label: "helpers.navigation.update",
                  action: () => {
                    router.push({
                      pathname: "/dashboard/products/[productid]/update",
                      params: {
                        productid: product.id,
                      },
                    });
                  },
                  icon: "edit",
                },
              ]}
            />
          </Row>
        </Column>
      </Card>
    </Host>
  );
}
