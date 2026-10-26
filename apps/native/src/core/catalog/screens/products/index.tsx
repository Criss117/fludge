import {
  Box,
  Host,
  Row,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { FlashList } from "@shopify/flash-list";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { ProductCard } from "@/core/catalog/components/product-card";
import { ProductsFiltersSheet } from "@/core/catalog/components/products-filters-sheet";
import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedNativeText, ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { useProducts, useProductsList } from "./use-products";

interface ListFooterProps {
  hasNextPage: boolean;
}
function ListFooterComponent({ hasNextPage }: ListFooterProps) {
  const { t } = useTranslation();

  if (!hasNextPage)
    return (
      <View style={styles.listEmptyContainer}>
        <ThemedText>{t("screens.catalog.products.no_more")}</ThemedText>
      </View>
    );

  return null;
}

const ItemSeparator = () => <View style={{ height: SPACING.sm }} />;

function ProductsList() {
  const { status, actions } = useProductsList();

  return (
    <FlashList
      data={status.items}
      contentContainerStyle={styles.listContentContainer}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => <ProductCard product={item} />}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={() => <ListFooterComponent hasNextPage={status.hasNextPage} />}
      ItemSeparatorComponent={ItemSeparator}
      onEndReachedThreshold={0.3}
      onEndReached={actions.handleEndReached}
    />
  );
}

export function ProductsScreen() {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const { texts, actions, state } = useProducts();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalAlignment="center"
            horizontalArrangement={{
              spacedBy: SPACING.sm,
            }}
          >
            <Box modifiers={[weight(1)]}>
              <SearchInput
                onValueChange={actions.setSearchQuery}
                label={texts.searchBar.label}
                placeholder={texts.searchBar.placeholder}
                defaultValue={state.filters.searchQuery}
                key={state.barcodeSearchIndex}
              />
            </Box>
            <BarcodeReader setBarcode={actions.setBarcode} />
          </Row>
        </Host>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Row
            modifiers={[fillMaxWidth()]}
            verticalAlignment="center"
            horizontalAlignment="center"
            horizontalArrangement={{
              spacedBy: SPACING.sm,
            }}
          >
            <SingleChoiceSegmentedButtonRow modifiers={[weight(1)]}>
              {state.statusOptions.map((item) => (
                <SegmentedButton
                  colors={{
                    activeContainerColor: colors.secondary,
                    activeContentColor: colors.onSecondary,
                  }}
                  key={item.value}
                  selected={actions.isStatusSelected(item.value)}
                  onClick={() => actions.setStatus(item.value)}
                >
                  <SegmentedButton.Label>
                    <ThemedNativeText
                      color={
                        actions.isStatusSelected(item.value) ? colors.onSecondary : colors.onSurface
                      }
                    >
                      {t(item.label)}
                    </ThemedNativeText>
                  </SegmentedButton.Label>
                </SegmentedButton>
              ))}
            </SingleChoiceSegmentedButtonRow>
            <ProductsFiltersSheet />
          </Row>
        </Host>
      </View>

      <View style={styles.listContainer}>
        <Suspense fallback={<BaseLoadingIndicator />}>
          <ProductsList />
        </Suspense>
      </View>

      <LinkFabButton
        action={{
          type: "push",
          href: "/dashboard/products/create",
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  header: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    rowGap: SPACING.sm,
  },
  listContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.md,
    paddingBottom: SPACING["3xl"],
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
