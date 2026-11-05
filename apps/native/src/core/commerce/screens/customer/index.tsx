import { StyleSheet, View } from "react-native";

import { CustomerHeader } from "@/core/commerce/components/customer-header";
import { ListContainer } from "@/core/shared/components/list-container";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";

import { SaleCard } from "../../components/sale-card";
import { SalesHeader } from "../../sections/sales-header";
import { useSalesScreen } from "../sales/use-sales-screen";
import type { CustomerScreenProps } from "./types";

export function CustomerScreen({ customer }: CustomerScreenProps) {
  const { actions, state, texts } = useSalesScreen(customer.id);

  return (
    <>
      <ThemedView style={styles.container}>
        <ListContainer
          isFetching={state.isFetching}
          hasNextPage={state.hasNextPage}
          isFetchingNextPage={state.isFetchingNextPage}
          noMoreText={texts.noMore}
          onEndReached={actions.handleEndReached}
          items={state.items}
          renderItem={({ item }) => <SaleCard sale={item} />}
          ListHeaderComponent={() => (
            <View>
              <CustomerHeader customer={customer} />
              <SalesHeader />
            </View>
          )}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    rowGap: SPACING.md,
  },
  contentTabs: {
    paddingHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
  },
});
