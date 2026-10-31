import { StyleSheet } from "react-native";

import { SaleCard } from "@/core/commerce/components/sale-card";
import { SalesHeader } from "@/core/commerce/sections/sales-header";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { ListContainer } from "@/core/shared/components/list-container";
import { ThemedView } from "@/core/shared/components/themed-view";

import { useSalesScreen } from "./use-sales-screen";

export function SalesScreen() {
  const { actions, state, texts } = useSalesScreen();

  return (
    <ThemedView style={styles.container}>
      <ListContainer
        isFetching={state.isFetching}
        hasNextPage={state.hasNextPage}
        isFetchingNextPage={state.isFetchingNextPage}
        noMoreText={texts.noMore}
        onEndReached={actions.handleEndReached}
        items={state.items}
        renderItem={({ item }) => <SaleCard sale={item} />}
        ListHeaderComponent={SalesHeader}
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
  },
});
