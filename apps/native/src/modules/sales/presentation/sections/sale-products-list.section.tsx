import { FlatList, View } from "react-native";
import {
  SalesProductCard,
  SALES_CARD_HEIGHT,
} from "../components/sales-product-card";
import { useFindProducts } from "@fludge/client/application/catalog/queries/use-find-products";
import { Typography } from "heroui-native";
import { useTranslation } from "react-i18next";
import type { ProductSummary } from "@fludge/client/application/catalog/domain/product.repository";

interface Props {
  onSelectProduct: (product: ProductSummary) => void;
  query: string;
}

const ROW_HEIGHT = SALES_CARD_HEIGHT + 8;

export function SaleProductsListSection({ onSelectProduct, query }: Props) {
  const { t } = useTranslation();
  const { data, fetchNextPage, hasNextPage } = useFindProducts({
    searchQuery: query,
  });

  const items = data.pages.flatMap((page) => page.items);

  return (
    <FlatList
      className="flex-1"
      data={items}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      columnWrapperClassName="gap-2 px-3"
      contentContainerClassName="flex-grow gap-2 pb-8"
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SalesProductCard product={item} onPress={onSelectProduct} />
      )}
      getItemLayout={(_, index) => ({
        length: ROW_HEIGHT,
        offset: ROW_HEIGHT * Math.floor(index / 2),
        index,
      })}
      onEndReached={() => {
        if (hasNextPage) fetchNextPage();
      }}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center">
          <Typography>{t("screens.sales.not_found")}</Typography>
        </View>
      }
      ListFooterComponent={
        items.length > 0 && !hasNextPage ? (
          <View className="items-center justify-center py-4">
            <Typography>{t("screens.sales.no_more")}</Typography>
          </View>
        ) : null
      }
    />
  );
}
