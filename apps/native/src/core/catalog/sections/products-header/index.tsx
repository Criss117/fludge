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
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { Icon } from "@/core/shared/components/icon";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useProductsHeader, useProductsOrderBySheet } from "./use-products-header";

function ProductsOrderBySheet() {
  const colors = useThemeColor();
  const { t } = useTranslation();
  const { actions, state } = useProductsOrderBySheet();

  return (
    <>
      <Button
        onClick={actions.open}
        colors={{
          containerColor: colors.surfaceVariant,
          contentColor: colors.onSurfaceVariant,
        }}
      >
        <ThemedNativeText color={colors.onSurfaceVariant}>
          {t("helpers.order_by.label")}
        </ThemedNativeText>
      </Button>

      {state.isPresented && (
        <ModalBottomSheet
          onDismissRequest={actions.close}
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
              {state.orderByButtons.map((b) => (
                <Button
                  key={b.value}
                  onClick={() => {
                    actions.setNextOrderBy(b.value);
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
