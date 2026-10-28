import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { ProductCard } from "@/core/catalog/components/product-card";
import { ProductsHeader } from "@/core/catalog/sections/products-header";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { ThemedText } from "@/core/shared/components/themed-text";
import { SPACING } from "@/lib/sp";

import { useProductsScreen } from "./use-products";

export function ProductsScreen() {
  const { state, actions, texts } = useProductsScreen();
  const { t } = useTranslation();

  return (
    <FlashList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.listContentContainer}
      showsVerticalScrollIndicator={false}
      data={state.items}
      keyExtractor={(i) => i.id}
      ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      ListHeaderComponent={() => <ProductsHeader />}
      renderItem={({ item }) => <ProductCard product={item} />}
      onEndReachedThreshold={0.3}
      onEndReached={actions.handleEndReached}
      ListFooterComponent={() => (
        <View style={styles.footer}>
          {!state.hasNextPage && <ThemedText>{t(texts.noMore)}</ThemedText>}

          {(state.isFetching || state.isFetchingNextPage) && <BaseLoadingIndicator />}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  host: {
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
    paddingBottom: SPACING.md,
  },
  listContentContainer: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  itemSeparator: {
    height: SPACING.md,
  },
  footer: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    justifyContent: "center",
    alignItems: "center",
  },
});
