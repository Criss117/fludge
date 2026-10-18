import { useFindSales } from "@fludge/client/commerce/queries/use-find-sales";
import { FlashList } from "@shopify/flash-list";
import { Suspense, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SaleCard } from "@/core/commerce/components/sale-card";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";

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

function SaleList() {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useFindSales();

  const items = useMemo(() => data.pages.flatMap((page) => page.items), [data.pages]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <FlashList
      data={items}
      contentContainerStyle={styles.listContentContainer}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => <SaleCard sale={item} />}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={() => <ListFooterComponent hasNextPage={hasNextPage} />}
      ItemSeparatorComponent={ItemSeparator}
      onEndReachedThreshold={0.3}
      onEndReached={handleEndReached}
    />
  );
}

export function SalesScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <View style={styles.listContainer}>
        <Suspense fallback={<BaseLoadingIndicator />}>
          <SaleList />
        </Suspense>
      </View>

      <LinkFabButton
        action={{
          type: "push",
          href: "/dashboard/pos",
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
