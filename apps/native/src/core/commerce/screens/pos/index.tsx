import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { TextInput } from "@/core/shared/components/text-input";
import {
  ThemedNativeText,
  ThemedText,
} from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import { Box, Button, Host, Row } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useFindProducts } from "@fludge/client/catalog/queries/use-find-products";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SaleProductCard } from "@/core/commerce/components/sale-product-card";
import { useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import type { ProductSummary } from "@fludge/client/catalog/domain/entities";
import type { AddCatalogTicketProduct } from "@fludge/client/commerce/domain/local-ticket.repository";
import { ProductPickerSheet } from "@/core/commerce/components/product-picker";

function ProductList({
  searchQuery,
  selectProduct,
}: {
  searchQuery: string;
  selectProduct: (product: ProductSummary) => void;
}) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useFindProducts({
      searchQuery,
      status: "active",
      orderBy: {
        createdAt: "desc",
        stock: "none",
      },
    });

  const items = useMemo(
    () => data.pages.flatMap((page) => page.items),
    [data.pages],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <FlashList
      contentContainerStyle={styles.listContentContainer}
      data={items}
      numColumns={2}
      keyExtractor={(i) => i.id}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      renderItem={({ item, index }) => (
        <View
          style={{
            flex: 1,
            paddingLeft: index % 2 === 0 ? 0 : SPACING.sm / 2,
            paddingRight: index % 2 === 0 ? SPACING.sm / 2 : 0,
          }}
        >
          <SaleProductCard product={item} onPress={selectProduct} />
        </View>
      )}
      onEndReachedThreshold={0.3}
      onEndReached={handleEndReached}
    />
  );
}

function Footer() {
  const activeTicketTotal = useTicketStore((s) => s.activeTicketTotal);
  const colors = useThemeColor();

  return (
    <View style={styles.footer}>
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <Button
          colors={{
            containerColor: colors.primary,
          }}
        >
          <ThemedNativeText color={colors.onPrimary}>
            Cobrar ({activeTicketTotal})
          </ThemedNativeText>
        </Button>
      </Host>
      <KeyboardSpacerView />
    </View>
  );
}

function useAddProductToTicket() {
  const addTicketProduct = useTicketStore((s) => s.addTicketProduct);

  return (
    product: ProductSummary,
    presentations: ProductSummary["presentations"],
  ) => {
    const ticketProduct: AddCatalogTicketProduct = {
      type: "catalog",
      name: product.name,
      stock: product.stock,
      minStock: product.minStock,
      allowNegativeStock: product.allowNegativeStock,
      productId: product.id,
      presentations: presentations.map((presentation) => ({
        conversionFactor: presentation.conversionFactor,
        name: presentation.name,
        originalPrice: presentation.priceSale,
        priceSale: presentation.priceSale,
        quantity: 1,
        wholesalePrice: presentation.priceWholesale ?? null,
        presentationId: presentation.id,
      })),
    };

    addTicketProduct(ticketProduct);
  };
}

export function POSScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(
    null,
  );
  const addToTicket = useAddProductToTicket();

  const handleCloseSheet = () => setSelectedProduct(null);

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
              <TextInput
                onValueChange={setSearchQuery}
                value={searchQuery}
                modifiers={[fillMaxWidth()]}
                iconName="search"
                label="screens.catalog.products.search.label"
                placeholder="screens.catalog.products.search.placeholder"
                withDebounce={400}
              />
            </Box>
            <BarcodeReader setBarcode={setSearchQuery} />
          </Row>
        </Host>
      </View>

      <View style={styles.productListContainer}>
        <ProductList
          searchQuery={searchQuery}
          selectProduct={setSelectedProduct}
        />
      </View>

      <Footer />

      <ProductPickerSheet
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={handleCloseSheet}
        onAdd={addToTicket}
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
  },
  footer: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  productListContainer: {
    paddingTop: SPACING.md,
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: SPACING.sm,
  },
});
