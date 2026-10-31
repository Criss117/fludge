import { StyleSheet, View } from "react-native";

import { ProductsHeader } from "@/core/catalog/sections/products-header";
import { ProductPicker } from "@/core/commerce/components/product-picker";
import { SaleProductCard } from "@/core/commerce/components/sale-product-card";
import { ListContainer } from "@/core/shared/components/list-container";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";

import { POSScreenFooter } from "./footer";
import { usePOSScreen } from "./use-pos-screens";

export function POSScreen() {
  const { state, actions, texts } = usePOSScreen();

  return (
    <ThemedView style={styles.container}>
      <ListContainer
        numColumns={2}
        isFetching={state.isFetching}
        hasNextPage={state.hasNextPage}
        isFetchingNextPage={state.isFetchingNextPage}
        noMoreText={texts.noMore}
        onEndReached={actions.handleEndReached}
        items={state.items}
        renderItem={({ item, index }) => (
          <View
            style={{
              flex: 1,
              paddingLeft: index % 2 === 0 ? 0 : SPACING.md / 2,
              paddingRight: index % 2 === 0 ? SPACING.md / 2 : 0,
            }}
          >
            <SaleProductCard product={item} onPress={actions.selectProduct} />
          </View>
        )}
        ListHeaderComponent={() => <ProductsHeader variant="pos" />}
      />
      <POSScreenFooter />
      <ProductPicker
        selectedProduct={state.selectedProduct}
        onAdd={actions.addToTicket}
        onClose={actions.removeSelectedProduct}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
