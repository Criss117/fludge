import { useFindSales } from "@fludge/client/application/sales/queries/use-find-sales";
import { Typography } from "heroui-native/text";
import { Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import {
  SALE_CARD_HEIGHT,
  SaleCard,
  SaleCardSkeleton,
} from "../components/sale-card";

const ITEM_SEPARATOR_HEIGHT = 12;

function ListEmptyComponent() {
  const { t } = useTranslation();

  return (
    <View className="items-center py-8">
      <Typography>{t("screens.sales.history.empty")}</Typography>
    </View>
  );
}

function ListFooterComponent({ hasNextPage }: { hasNextPage: boolean }) {
  const { t } = useTranslation();

  if (!hasNextPage) {
    return (
      <View className="items-center py-4">
        <Typography>{t("screens.sales.history.no_more")}</Typography>
      </View>
    );
  }

  return (
    <View className="gap-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <SaleCardSkeleton key={i} />
      ))}
    </View>
  );
}

function SalesScreenList() {
  const { data, fetchNextPage, hasNextPage } = useFindSales("");

  const items = useMemo(() => data.pages.flatMap((page) => page.items), [data]);

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="pb-40"
      data={items}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <SaleCard sale={item} />}
      ItemSeparatorComponent={
        <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
      }
      getItemLayout={(_, index) => ({
        length: SALE_CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT,
        offset: (SALE_CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT) * index,
        index,
      })}
      onEndReachedThreshold={0.5}
      onEndReached={() => {
        if (hasNextPage) fetchNextPage();
      }}
      ListFooterComponentClassName="py-4"
      ListFooterComponent={<ListFooterComponent hasNextPage={hasNextPage} />}
      ListEmptyComponent={<ListEmptyComponent />}
    />
  );
}

export function SalesScreen() {
  return (
    <View className="relative flex-1 gap-y-3 px-3 pt-2">
      <Suspense fallback={<SalesScreenSkeleton />}>
        <SalesScreenList />
      </Suspense>
    </View>
  );
}

export function SalesScreenSkeleton() {
  return (
    <View className="gap-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <SaleCardSkeleton key={i} />
      ))}
    </View>
  );
}
