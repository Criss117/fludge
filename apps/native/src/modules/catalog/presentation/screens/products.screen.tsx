import { useFindProducts } from "@fludge/client/application/catalog/queries/use-find-products";
import { FlatList, View } from "react-native";
import {
  CARD_HEIGHT,
  ProductCard,
  ProductCardSkeleton,
} from "../components/product-card";
import { FloatingLink } from "@/modules/shared/components/floating-link";
import { DEFAULT_CARD_PADDING } from "@/modules/shared/utils/constanst";
import { Typography } from "heroui-native/text";
import { useTranslation } from "react-i18next";
import { SearchInput } from "@/modules/shared/components/search-input";
import { Suspense, useMemo, useState } from "react";
import { CameraDialog } from "@/modules/shared/components/camera-dialog";
import type { FindAllProductsFilters } from "@fludge/client/application/catalog/domain/product.repository";

interface ListFooterProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const ITEM_SEPARATOR_HEIGHT = 16;

function ListFooterComponent({
  hasNextPage,
  isFetchingNextPage,
}: ListFooterProps) {
  const { t } = useTranslation();

  if (isFetchingNextPage) return <ProductsListSkeleton length={10} />;

  if (!hasNextPage)
    return (
      <View className="flex-row items-center justify-center">
        <Typography>{t("screens.products.no_more")}</Typography>
      </View>
    );

  return null;
}

function ProductsScreenList({ filters }: { filters: FindAllProductsFilters }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFindProducts(filters);

  const items = useMemo(() => data.pages.flatMap((page) => page.items), [data]);

  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="pb-40"
      data={items}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <ProductCard product={item} />}
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
        <ListFooterComponent
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      }
    />
  );
}

function ProductsListSkeleton({ length = 3 }: { length?: number }) {
  return (
    <View className="gap-y-4 pb-40">
      {Array.from({ length }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function ProductsScreen() {
  const [filters, setFilters] = useState<FindAllProductsFilters>({
    searchQuery: "",
    status: "all",
    orderBy: {
      createdAt: "desc",
      stock: "asc",
    },
  });

  const setSearchQuery = (query: string) =>
    setFilters((prev) => ({ ...prev, searchQuery: query }));

  return (
    <View className="relative flex-1 gap-y-3 px-3 pt-2">
      <View className="flex-row items-center gap-x-2">
        <View className="flex-1">
          <SearchInput
            query={filters.searchQuery}
            setQuery={setSearchQuery}
            placeholder="helpers.placeholder.search_products"
          />
        </View>
        <CameraDialog setBarcode={setSearchQuery} />
      </View>
      <Suspense fallback={<ProductsListSkeleton />}>
        <ProductsScreenList filters={filters} />
      </Suspense>

      <View className="absolute right-0 bottom-20 px-3">
        <FloatingLink
          href={{
            pathname: "/(private)/dashboard/products/create",
          }}
        />
      </View>
    </View>
  );
}
