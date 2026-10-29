import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { CustomerCard } from "@/core/commerce/components/customer-card";
import { CustomersHeader } from "@/core/commerce/sections/customers-header";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";

import { useCustomersScreen } from "./use-customers-screen";

export function CustomersScreen() {
  const { actions, state, texts } = useCustomersScreen();
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        data={state.items}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        ListHeaderComponent={() => <CustomersHeader />}
        renderItem={({ item }) => <CustomerCard customer={item} />}
        onEndReachedThreshold={0.3}
        onEndReached={actions.handleEndReached}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            {!state.hasNextPage && <ThemedText>{t(texts.noMore)}</ThemedText>}

            {(state.isFetching || state.isFetchingNextPage) && <BaseLoadingIndicator />}
          </View>
        )}
      />

      <LinkFabButton
        action={{
          type: "push",
          href: "/dashboard/customers/create",
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
