import { useFindProducts } from "@fludge/client/application/catalog/queries/use-find-products";
import { FlatList, View } from "react-native";
import { CARD_HEIGHT, ProductCard } from "../components/product-card";
import { FloatingLink } from "@/modules/shared/components/floating-link";
import { DEFAULT_CARD_PADDING } from "@/modules/shared/utils/constanst";
import { Typography } from "heroui-native/text";

interface Props {
  query: string;
}

const ITEM_SEPARATOR_HEIGHT = 16;

export function ProductsSection({ query }: Props) {
  const { data, fetchNextPage, hasNextPage } = useFindProducts({
    query,
  });

  return (
    <View className="relative flex-1">
      <FlatList
        className="flex-1 pb-1"
        data={data}
        contentContainerStyle={{ paddingBottom: 124 }}
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
      />
      <View className="absolute right-0 bottom-20">
        <FloatingLink
          href={{
            pathname: "/(private)/dashboard/members/register",
          }}
        />
      </View>
    </View>
  );
}

export function ProductsSectionSkeleton() {
  return <Typography>Loading...</Typography>;
}
