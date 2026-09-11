import {
  CameraDialog,
  CameraDialogSkeleton,
} from "@/modules/shared/components/camera-dialog";
import {
  SearchInput,
  SearchInputSkeleton,
} from "@/modules/shared/components/search-input";
import { useFindProducts } from "@fludge/client/application/catalog/queries/use-find-products";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useCallback, useState } from "react";
import type { ProductSummary } from "@fludge/client/application/catalog/queries/use-find-products";
import {
  SALES_CARD_HEIGHT,
  SalesProductCard,
} from "../components/sales-product-card";
import { SalesProductCardSkeleton } from "../components/sales-product-card-skeleton";
import { TicketSelector } from "../components/ticket-selector";
import { SalesFooter } from "../components/sales-footer";
import { SalesSummaryBottomSheet } from "../components/sales-summary-bottom-sheet";
import { ProductPresentationsDialog } from "../components/product-presentations-dialog";

const ROW_HEIGHT = SALES_CARD_HEIGHT + 8;

export function SalesScreen() {
  const [query, setQuery] = useState("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(
    null,
  );
  const handleProductPress = useCallback(
    (product: ProductSummary) => setSelectedProduct(product),
    [],
  );
  const closeProductPresentations = useCallback(
    () => setSelectedProduct(null),
    [],
  );
  const { t } = useTranslation();
  const { data, fetchNextPage, hasNextPage, isReady, isLoading } =
    useFindProducts({ query });

  if (isLoading) {
    return <SalesScreenSkeleton />;
  }

  return (
    <View style={styles.screen}>
      <TicketSelector />
      <View style={styles.toolbar}>
        <View style={styles.search}>
          <SearchInput
            query={query}
            setQuery={setQuery}
            placeholder="helpers.placeholder.search_products"
          />
        </View>
        <CameraDialog setBarcode={setQuery} />
      </View>
      {isReady && (
        <FlatList
          className="flex-1"
          data={data}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 8, paddingHorizontal: 12 }}
          contentContainerStyle={[
            styles.listContent,
            { gap: 8 },
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SalesProductCard product={item} onPress={handleProductPress} />
          )}
          getItemLayout={(_, index) => ({
            length: ROW_HEIGHT,
            offset: ROW_HEIGHT * Math.floor(index / 2),
            index,
          })}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Typography>{t("screens.sales.not_found")}</Typography>
            </View>
          }
          ListFooterComponent={
            data.length > 0 && !hasNextPage ? (
              <View style={styles.footer}>
                <Typography>{t("screens.sales.no_more")}</Typography>
              </View>
            ) : null
          }
        />
      )}
      <SalesFooter onOpenSummary={() => setIsSummaryOpen(true)} />
      <SalesSummaryBottomSheet
        isOpen={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
      />
      <ProductPresentationsDialog
        product={selectedProduct}
        onClose={closeProductPresentations}
      />
    </View>
  );
}

function SalesScreenSkeleton() {
  return (
    <View style={styles.screen}>
      <TicketSelector />
      <View style={styles.toolbar}>
        <View style={styles.search}>
          <SearchInputSkeleton placeholder="helpers.placeholder.search_products" />
        </View>
        <CameraDialogSkeleton />
      </View>
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SalesProductCardSkeleton key={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 12,
    paddingTop: 8,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  search: {
    flex: 1,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
  },
  listContent: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
});
