import type { TranslationKey } from "@fludge/i18n/index";
import type { ListRenderItem } from "@shopify/flash-list";
import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { SPACING } from "@/lib/sp";

import { BaseLoadingIndicator } from "./base-loading-indicator";
import { ThemedText } from "./themed-text";

interface Props<T extends { id: string }> {
  items: T[];
  hasNextPage: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  noMoreText: TranslationKey;
  ListHeaderComponent?: () => React.ReactNode;
  renderItem: ListRenderItem<T>;
  onEndReached: () => void;
}

export function ListContainer<T extends { id: string }>({
  items,
  onEndReached,
  ListHeaderComponent,
  renderItem,
  hasNextPage,
  isFetching,
  isFetchingNextPage,
  noMoreText,
}: Props<T>) {
  const { t } = useTranslation();

  return (
    <FlashList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.listContentContainer}
      showsVerticalScrollIndicator={false}
      data={items}
      keyExtractor={(i) => i.id}
      ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      ListHeaderComponent={ListHeaderComponent}
      renderItem={renderItem}
      onEndReachedThreshold={0.3}
      onEndReached={onEndReached}
      ListFooterComponent={() => (
        <View style={styles.footer}>
          {!hasNextPage && <ThemedText>{t(noMoreText)}</ThemedText>}

          {(isFetching || isFetchingNextPage) && <BaseLoadingIndicator />}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    columnGap: SPACING.sm,
    alignItems: "center",
    paddingBottom: SPACING.md,
  },
  listContentContainer: {
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
