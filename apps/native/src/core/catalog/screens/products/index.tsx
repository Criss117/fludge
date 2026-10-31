import { StyleSheet } from "react-native";

import { ProductCard } from "@/core/catalog/components/product-card";
import { ProductsHeader } from "@/core/catalog/sections/products-header";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { TabsListContainer } from "@/core/shared/components/tabs-list-container";
import { ThemedView } from "@/core/shared/components/themed-view";

import { useProductsScreen } from "./use-products-screen";

export function ProductsScreen() {
  const { state, actions, texts } = useProductsScreen();

  return (
    <ThemedView style={styles.container}>
      <TabsListContainer
        isFetching={state.isFetching}
        hasNextPage={state.hasNextPage}
        isFetchingNextPage={state.isFetchingNextPage}
        noMoreText={texts.noMore}
        onEndReached={actions.handleEndReached}
        items={state.items}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListHeaderComponent={ProductsHeader}
      />
      <LinkFabButton
        action={{
          href: "/dashboard/products/create",
          type: "push",
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
