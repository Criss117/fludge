import { useFindCustomers } from "@fludge/client/application/customer/queries/use-find-customers";
import { FlatList, View } from "react-native";
import {
  CARD_HEIGHT,
  CustomerCard,
  CustomerCardSkeleton,
} from "../components/customer-card";
import { DEFAULT_CARD_PADDING } from "@/modules/shared/utils/constanst";
import { FloatingLink } from "@/modules/shared/components/floating-link";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { SearchInput } from "@/modules/shared/components/search-input";
import { Suspense, useMemo, useState } from "react";

const ITEM_SEPARATOR_HEIGHT = 16;

function ListEmptyComponent() {
  const { t } = useTranslation();

  return (
    <View className="items-center py-8">
      <Typography>{t("screens.customers.not_found")}</Typography>
    </View>
  );
}

function ListFooterComponent({ hasNextPage }: { hasNextPage: boolean }) {
  const { t } = useTranslation();

  if (!hasNextPage) {
    return (
      <View className="items-center py-4">
        <Typography>{t("screens.customers.no_more")}</Typography>
      </View>
    );
  }

  return <CustomersListSkeleton length={3} />;
}

function CustomersListSkeleton({ length = 3 }: { length?: number }) {
  return (
    <View className="gap-y-4 pb-40">
      {Array.from({ length }).map((_, i) => (
        <CustomerCardSkeleton key={i} />
      ))}
    </View>
  );
}

function CustomersScreenList({ searchQuery }: { searchQuery: string }) {
  const { data, fetchNextPage, hasNextPage } = useFindCustomers({
    searchQuery,
  });

  const items = useMemo(() => data.pages.flatMap((page) => page.items), [data]);

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="pb-40"
      data={items}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <CustomerCard customer={item} />}
      ItemSeparatorComponent={
        <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
      }
      getItemLayout={(_, index) => ({
        length: CARD_HEIGHT + DEFAULT_CARD_PADDING * 2,
        offset: (CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT) * index,
        index,
      })}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (hasNextPage) fetchNextPage();
      }}
      ListFooterComponentClassName="py-4"
      ListFooterComponent={
        <ListFooterComponent hasNextPage={hasNextPage} />
      }
      ListEmptyComponent={<ListEmptyComponent />}
    />
  );
}

export function CustomersScreen() {
  const [query, setQuery] = useState("");

  return (
    <View className="relative flex-1 gap-y-3 px-3 pt-2">
      <SearchInput
        query={query}
        setQuery={setQuery}
        placeholder="helpers.placeholder.search_customers"
      />
      <Suspense fallback={<CustomersListSkeleton />}>
        <CustomersScreenList searchQuery={query} />
      </Suspense>

      <View className="absolute right-0 bottom-20 px-3">
        <FloatingLink
          href={{
            pathname: "/(private)/dashboard/customers/create",
          }}
        />
      </View>
    </View>
  );
}