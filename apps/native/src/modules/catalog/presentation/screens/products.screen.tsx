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
import { useState } from "react";
import { CameraDialog } from "@/modules/shared/components/camera-dialog";
import { useProductsCollection } from "@fludge/client/application/catalog/collections/products.collection";
import { useProductsPresentationsCollection } from "@fludge/client/application/catalog/collections/product-presentations.container";
import { useLiveQuery } from "@tanstack/react-db";

interface ListFooterProps {
  hasNextPage: boolean;
}

const ITEM_SEPARATOR_HEIGHT = 16;

function ListFooterComponent({ hasNextPage }: ListFooterProps) {
  const { t } = useTranslation();
  if (!hasNextPage)
    return (
      <View>
        <Typography>{t("screens.products.no_more")}</Typography>
      </View>
    );

  return <ProductsScreenSkeleton />;
}

export function ProductsScreen() {
  const [query, setQuery] = useState("");
  const { productCollection } = useProductsCollection();
  const { productPresentationsCollection } =
    useProductsPresentationsCollection();
  const { data, fetchNextPage, hasNextPage, isLoading } = useFindProducts({
    query,
  });

  const { data: products } = useLiveQuery((q) => q.from({ productCollection }));
  const { data: presentations } = useLiveQuery((q) =>
    q.from({ productPresentationsCollection })
  );

  if (isLoading) return <ProductsScreenSkeleton length={10} />;

  return (
    <View className="relative flex-1 gap-y-3 px-3 pt-2">
      <View className="flex-row items-center">
        <View className="flex-1">
          <SearchInput
            query={query}
            setQuery={setQuery}
            placeholder="helpers.placeholder.search_products"
          />
        </View>
        <CameraDialog setBarcode={setQuery} />
      </View>
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
        ListFooterComponent={
          <Typography.Code>
            {JSON.stringify(products, null, 2)}
            {JSON.stringify(presentations, null, 2)}
          </Typography.Code>
        }
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
      {Array.from({ length }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}
