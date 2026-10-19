import { Box, Button, Column, Host, Row, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight, width } from "@expo/ui/jetpack-compose/modifiers";
import type { ProductSummary } from "@fludge/client/catalog/domain/entities";
import { useFindProducts } from "@fludge/client/catalog/queries/use-find-products";
import type { AddCatalogTicketProduct } from "@fludge/client/commerce/domain/local-ticket.repository";
import { useActiveTicket, useTicketStore } from "@fludge/client/providers/ticket-store.provider";
import { formatCurrency } from "@fludge/utils/format-currency";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { ProductPickerSheet } from "@/core/commerce/components/product-picker";
import { SaleProductCard } from "@/core/commerce/components/sale-product-card";
import { TicketDetailSheet } from "@/core/commerce/components/ticket-detail-sheet";
import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { Icon } from "@/core/shared/components/icon";
import { KeyboardSpacerView } from "@/core/shared/components/keyboard-spacer-view";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

function ProductList({
  searchQuery,
  selectProduct,
}: {
  searchQuery: string;
  selectProduct: (product: ProductSummary) => void;
}) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useFindProducts({
    searchQuery,
    status: "active",
    orderBy: [
      {
        direction: "asc",
        field: "createdAt",
      },
    ],
  });

  const items = useMemo(() => data.pages.flatMap((page) => page.items), [data.pages]);

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

function Footer({ onSeeCart }: { onSeeCart: () => void }) {
  const { t } = useTranslation();
  const activeTicket = useActiveTicket();
  const colors = useThemeColor();

  return (
    <View style={styles.footer}>
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <Row
          horizontalArrangement={{
            spacedBy: SPACING.md,
          }}
          verticalAlignment="center"
        >
          <Column>
            <ThemedNativeText variant="muted">{t("screens.pos.current_sale")}</ThemedNativeText>
            <ThemedNativeText>{formatCurrency(activeTicket?.total ?? 0)}</ThemedNativeText>
          </Column>

          <Button
            colors={{
              containerColor: colors.primary,
            }}
            modifiers={[fillMaxWidth()]}
            onClick={onSeeCart}
          >
            <ThemedNativeText color={colors.onPrimary}>
              {t("screens.pos.see_cart")}
            </ThemedNativeText>
            <Spacer modifiers={[width(SPACING.sm)]} />
            <Icon name="arrow-forward" size={20} color={colors.onPrimary} />
          </Button>
        </Row>
      </Host>

      <KeyboardSpacerView />
    </View>
  );
}

function useAddProductToTicket() {
  const addTicketProduct = useTicketStore((s) => s.addTicketProduct);

  return (product: ProductSummary, presentations: ProductSummary["presentations"]) => {
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
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);
  const addToTicket = useAddProductToTicket();

  const handleCloseProductSheet = () => setSelectedProduct(null);
  const handleOpenTicketDetail = () => setIsTicketDetailOpen(true);
  const handleCloseTicketDetail = () => setIsTicketDetailOpen(false);

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
        <ProductList searchQuery={searchQuery} selectProduct={setSelectedProduct} />
      </View>

      <Footer onSeeCart={handleOpenTicketDetail} />

      <ProductPickerSheet
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={handleCloseProductSheet}
        onAdd={addToTicket}
      />

      <TicketDetailSheet isOpen={isTicketDetailOpen} onClose={handleCloseTicketDetail} />
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
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  footerContent: {
    flexDirection: "row",
  },
  productListContainer: {
    paddingTop: SPACING.md,
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: SPACING.sm,
  },
});
