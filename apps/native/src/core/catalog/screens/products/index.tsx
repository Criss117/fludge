import { BarcodeReader } from "@/core/shared/components/barcode-reader";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";
import { Box, Host, Row } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useFindProducts } from "@fludge/client/catalog/queries/use-find-products";
import { FlashList } from "@shopify/flash-list";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ProductCard } from "@/core/catalog/components/product-card";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";

interface ListFooterProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}
function ListFooterComponent({
  hasNextPage,
  isFetchingNextPage,
}: ListFooterProps) {
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

function ProductsList({ searchQuery }: { searchQuery: string }) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useFindProducts({
      searchQuery,
      status: "all",
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
      data={items}
      contentContainerStyle={styles.listContentContainer}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => <ProductCard product={item} />}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={() => (
        <ListFooterComponent
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
      ItemSeparatorComponent={ItemSeparator}
      onEndReachedThreshold={0.3}
      onEndReached={handleEndReached}
    />
  );
}

export function ProductsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

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

      <View style={styles.listContainer}>
        <Suspense fallback={<BaseLoadingIndicator />}>
          <ProductsList searchQuery={searchQuery} />
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
