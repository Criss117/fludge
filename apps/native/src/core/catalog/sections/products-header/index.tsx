import {
  Box,
  Button,
  Column,
  FilterChip,
  Host,
  LazyRow,
  ModalBottomSheet,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useFilters } from "@fludge/client/providers/filters.provider";
import type { OrderByField } from "@fludge/client/shared/use-filters";
import type { TranslationKey } from "@fludge/i18n/index";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import type { iconName } from "@/core/shared/components/icon";
import { Icon } from "@/core/shared/components/icon";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useProductsHeader } from "./use-products-header";

const orderByItems: { key: OrderByField; label: TranslationKey }[] = [
  {
    key: "createdAt",
    label: "helpers.order_by.created_at",
  },
  {
    key: "stock",
    label: "helpers.order_by.stock",
  },
  {
    key: "minStock",
    label: "helpers.order_by.min_stock",
  },
];

function ProductsOrderBySheet() {
  const { filters, setNextOrderBy } = useFilters();
  const [isPresented, setIsPresented] = useState(false);
  const colors = useThemeColor();
  const { t } = useTranslation();

  const open = () => setIsPresented(true);
  const close = () => setIsPresented(false);

  const orderByButtons = useMemo(() => {
    return orderByItems.map((i) => {
      const exists = filters.orderBy?.find((o) => o.field === i.key);

      let iconName: iconName = "remove";

      if (exists !== undefined) {
        switch (exists.direction) {
          case "asc":
            iconName = "keyboard-arrow-up";
            break;
          case "desc":
            iconName = "keyboard-arrow-down";
            break;
        }
      }

      return {
        ...i,
        icon: iconName,
      };
    });
  }, [filters.orderBy]);

  return (
    <>
      <Button
        onClick={open}
        colors={{
          containerColor: colors.surfaceVariant,
          contentColor: colors.onSurfaceVariant,
        }}
      >
        <ThemedNativeText color={colors.onSurfaceVariant}>
          {t("helpers.order_by.label")}
        </ThemedNativeText>
      </Button>

      {isPresented && (
        <ModalBottomSheet
          onDismissRequest={close}
          skipPartiallyExpanded
          containerColor={colors.background}
          contentColor={colors.onBackground}
        >
          <Column
            modifiers={[padding(SPACING.xl, SPACING.md, SPACING.xl, SPACING.md)]}
            verticalArrangement={{ spacedBy: SPACING.md }}
          >
            <ThemedNativeText variant="h5">{t("helpers.order_by.title")}</ThemedNativeText>

            <Column verticalArrangement={{ spacedBy: SPACING.md }}>
              {orderByButtons.map((b) => (
                <Button
                  key={b.key}
                  onClick={() => {
                    setNextOrderBy(b.key);
                  }}
                  colors={{
                    containerColor: "transparent",
                    contentColor: colors.onBackground,
                  }}
                >
                  <Row
                    modifiers={[fillMaxWidth()]}
                    verticalAlignment="center"
                    horizontalArrangement={{ spacedBy: SPACING.sm }}
                  >
                    <ThemedNativeText>{t(b.label)}</ThemedNativeText>
                    <Spacer modifiers={[weight(1)]} />
                    <Icon name={b.icon} size={18} color={colors.primary} />
                  </Row>
                </Button>
              ))}
            </Column>
          </Column>
        </ModalBottomSheet>
      )}
    </>
  );
}

export function ProductsHeader() {
  const { actions, state, texts } = useProductsHeader();
  const colors = useThemeColor();
  const { t } = useTranslation();

  return (
    <View style={styles.headerContainer}>
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <Column modifiers={[fillMaxWidth()]} verticalArrangement={{ spacedBy: SPACING.md }}>
          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: SPACING.sm }}
          >
            <BarcodeReader setBarcode={actions.setSearchQuery} />
            <Box modifiers={[weight(1)]}>
              <SearchInput
                onValueChange={actions.setSearchQuery}
                label={texts.searchBar.label}
                placeholder={texts.searchBar.placeholder}
                defaultValue={state.filters.searchQuery}
              />
            </Box>
          </Row>

          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: SPACING.sm }}
          >
            <ProductsOrderBySheet />

            <Box modifiers={[weight(1)]}>
              <LazyRow horizontalArrangement={{ spacedBy: SPACING.sm }} verticalAlignment="center">
                {state.statusOptions.map((sp) => (
                  <FilterChip
                    key={sp.value}
                    selected={actions.isStatusSelected(sp.value)}
                    onClick={() => actions.setStatus(sp.value)}
                    colors={{
                      containerColor: colors.surfaceVariant,
                      labelColor: colors.outline,
                      selectedContainerColor: colors.primaryContainer,
                      selectedLabelColor: colors.onPrimaryContainer,
                    }}
                  >
                    <FilterChip.Label>
                      <ThemedNativeText
                        color={
                          actions.isStatusSelected(sp.value)
                            ? colors.onPrimaryContainer
                            : colors.outline
                        }
                      >
                        {t(sp.label)}
                      </ThemedNativeText>
                    </FilterChip.Label>
                  </FilterChip>
                ))}
              </LazyRow>
            </Box>
          </Row>
        </Column>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    width: "100%",
  },
  headerContainer: {
    rowGap: SPACING.sm,
    alignItems: "center",
    paddingBottom: SPACING.md,
  },
});
