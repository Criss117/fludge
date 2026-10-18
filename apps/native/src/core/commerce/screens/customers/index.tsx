import { Box, Host, Row } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, weight } from "@expo/ui/jetpack-compose/modifiers";
import { useFindCustomers } from "@fludge/client/commerce/queries/use-find-customers";
import { FlashList } from "@shopify/flash-list";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CustomerCard } from "@/core/commerce/components/customer-card";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { TextInput } from "@/core/shared/components/text-input";
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
        <ThemedText>{t("screens.customers.no_more")}</ThemedText>
      </View>
    );

  return null;
}

const ItemSeparator = () => <View style={{ height: SPACING.sm }} />;

function CustomersList({ searchQuery }: { searchQuery: string }) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useFindCustomers({
    searchQuery,
  });

  const items = useMemo(() => data.pages.flatMap((page) => page.items), [data.pages]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <FlashList
      data={items}
      contentContainerStyle={styles.listContentContainer}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => <CustomerCard customer={item} />}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={() => <ListFooterComponent hasNextPage={hasNextPage} />}
      ItemSeparatorComponent={ItemSeparator}
      onEndReachedThreshold={0.3}
      onEndReached={handleEndReached}
    />
  );
}

export function CustomersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { top } = useSafeAreaInsets();

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: top,
        },
      ]}
    >
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
                label="screens.customers.search.label"
                placeholder="helpers.placeholder.search_customers"
                withDebounce={400}
              />
            </Box>
          </Row>
        </Host>
      </View>

      <View style={styles.listContainer}>
        <Suspense fallback={<BaseLoadingIndicator />}>
          <CustomersList searchQuery={searchQuery} />
        </Suspense>
      </View>

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
