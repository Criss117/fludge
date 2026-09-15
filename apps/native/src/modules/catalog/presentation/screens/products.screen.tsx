import {
  useFindProducts,
  useInvalidateProducts,
} from "@fludge/client/application/catalog/queries/use-find-products";
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
import {
  SearchInput,
  SearchInputSkeleton,
} from "@/modules/shared/components/search-input";
import { useMemo, useState } from "react";
import {
  CameraDialog,
  CameraDialogSkeleton,
} from "@/modules/shared/components/camera-dialog";
import { ProductSummary } from "@fludge/client/application/catalog/domain/product.repository";
import { Button } from "heroui-native/button";

interface ListFooterProps {
  hasNextPage: boolean;
}

const ITEM_SEPARATOR_HEIGHT = 16;

function ListFooterComponent({ hasNextPage }: ListFooterProps) {
  const { t } = useTranslation();

  if (hasNextPage) return null;

  return (
    <View className="flex-row items-center justify-center">
      <Typography>{t("screens.products.no_more")}</Typography>
    </View>
  );
}

function ProductsScreenList({
  data,
  fetchNextPage,
  hasNextPage,
}: {
  data: ProductSummary[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
}) {
  return (
    <FlatList
      className="flex-1"
      contentContainerClassName="pb-40"
      data={data}
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
      ListFooterComponent={<ListFooterComponent hasNextPage={hasNextPage} />}
    />
  );
}

export function ProductsScreen() {
  const [query, setQuery] = useState("");
  const { invalidateList } = useInvalidateProducts();
  const { data, fetchNextPage, hasNextPage } = useFindProducts({
    searchQuery: query,
  });

  const items = useMemo(() => data.pages.flatMap((page) => page.items), [data]);

  return (
    <View className="relative flex-1 gap-y-3 px-3 pt-2">
      <View className="flex-row items-center gap-x-2">
        <View className="flex-1">
          <SearchInput
            query={query}
            setQuery={setQuery}
            placeholder="helpers.placeholder.search_products"
          />
        </View>
        <CameraDialog setBarcode={setQuery} />
      </View>
      <Button
        onPress={() => {
          invalidateList();
        }}
      >
        Invalidar
      </Button>
      <ProductsScreenList
        data={items}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
      />

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

export function ProductsScreenSkeleton({ length = 3 }: { length?: number }) {
  return (
    <View className="relative flex-1 gap-y-3 px-3 pt-2">
      <View className="flex-row items-center gap-x-2">
        <View className="flex-1">
          <SearchInputSkeleton placeholder="helpers.placeholder.search_products" />
        </View>
        <CameraDialogSkeleton />
      </View>
      {Array.from({ length }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}
