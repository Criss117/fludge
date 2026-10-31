import { StyleSheet } from "react-native";

import { CustomerCard } from "@/core/commerce/components/customer-card";
import { CustomersHeader } from "@/core/commerce/sections/customers-header";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { ListContainer } from "@/core/shared/components/list-container";
import { ThemedView } from "@/core/shared/components/themed-view";

import { useCustomersScreen } from "./use-customers-screen";

export function CustomersScreen() {
  const { actions, state, texts } = useCustomersScreen();

  return (
    <ThemedView style={styles.container}>
      <ListContainer
        isFetching={state.isFetching}
        hasNextPage={state.hasNextPage}
        isFetchingNextPage={state.isFetchingNextPage}
        noMoreText={texts.noMore}
        onEndReached={actions.handleEndReached}
        items={state.items}
        renderItem={({ item }) => <CustomerCard customer={item} />}
        ListHeaderComponent={CustomersHeader}
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
});
