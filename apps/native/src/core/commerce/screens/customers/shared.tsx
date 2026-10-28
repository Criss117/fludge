import { useFindCustomers } from "@fludge/client/commerce/queries/use-find-customers";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { CustomerCard } from "@/core/commerce/components/customer-card";
import { CustomersHeader } from "@/core/commerce/sections/customers-header";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { ThemedText } from "@/core/shared/components/themed-text";
import { SPACING } from "@/lib/sp";

interface CustomersListProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function CustomersList({ searchQuery, onSearchChange }: CustomersListProps) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useFindCustomers({
    searchQuery,
  });
  const { t } = useTranslation();

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <FlashList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.listContentContainer}
      showsVerticalScrollIndicator={false}
      data={items}
      keyExtractor={(i) => i.id}
      ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      ListHeaderComponent={() => (
        <CustomersHeader searchQuery={searchQuery} onSearchChange={onSearchChange} />
      )}
      renderItem={({ item }) => <CustomerCard customer={item} />}
      onEndReachedThreshold={0.3}
      onEndReached={handleEndReached}
      ListFooterComponent={() => (
        <View style={styles.footer}>
          {!hasNextPage && <ThemedText>{t("screens.customers.no_more")}</ThemedText>}
          {isFetchingNextPage && <BaseLoadingIndicator />}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContentContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING["3xl"],
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
