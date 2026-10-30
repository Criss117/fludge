import { useFindSales } from "@fludge/client/commerce/queries/use-find-sales";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SaleCard } from "@/core/commerce/components/sale-card";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";

export function SalesScreen() {
  const { top } = useSafeAreaInsets();
  const { t } = useTranslation();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isFetching } = useFindSales();

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <FlashList
        data={items}
        contentContainerStyle={styles.listContentContainer}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <SaleCard sale={item} />}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            {!hasNextPage && <ThemedText>{t("screens.sales.list.no_more")}</ThemedText>}

            {(isFetching || isFetchingNextPage) && <BaseLoadingIndicator />}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        onEndReachedThreshold={0.3}
        onEndReached={handleEndReached}
        contentInsetAdjustmentBehavior="automatic"
      />

      <LinkFabButton
        action={{
          type: "push",
          href: "/pos",
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
    paddingHorizontal: SPACING.md,
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemSeparator: {
    height: SPACING.md,
  },
  host: {
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
    paddingBottom: SPACING.md,
  },
  footer: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    justifyContent: "center",
    alignItems: "center",
  },
});
