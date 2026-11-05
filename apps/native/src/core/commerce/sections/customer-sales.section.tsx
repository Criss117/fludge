import { StyleSheet } from "react-native";

import { ListContainer } from "@/core/shared/components/list-container";
import { ThemedView } from "@/core/shared/components/themed-view";

import { SaleCard } from "../components/sale-card";
import { useSalesScreen } from "../screens/sales/use-sales-screen";
import { SalesHeader } from "./sales-header";

export function CustomerSalesSection({ customerId }: { customerId: string }) {
  const { actions, state, texts } = useSalesScreen(customerId);

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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
