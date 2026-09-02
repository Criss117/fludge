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

interface Props {
  query: string;
}

interface ListFooterProps {
  hasNextPage: boolean;
}

const ITEM_SEPARATOR_HEIGHT = 16;

function ListFooterComponent({ hasNextPage }: ListFooterProps) {
  if (!hasNextPage)
    return (
      <View>
        <Typography>No hay más productos</Typography>
      </View>
    );

  return <ProductsSectionSkeleton />;
}

export function ProductsSection({ query }: Props) {
  const { data, fetchNextPage, hasNextPage, isLoading, isReady } =
    useFindProducts({
      query,
    });

  if (isLoading && !isReady) return <ProductsSectionSkeleton length={10} />;

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
        ListFooterComponentClassName="py-4"
        ListFooterComponent={<ListFooterComponent hasNextPage={hasNextPage} />}
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

export function ProductsSectionSkeleton({ length = 3 }: { length?: number }) {
  return (
    <View className="gap-y-4">
      {Array.from({ length }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}
