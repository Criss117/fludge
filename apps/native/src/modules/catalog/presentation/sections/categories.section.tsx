import { useFindCategories } from "@fludge/client/application/catalog/queries/use-find-categories";
import { FlatList, View } from "react-native";
import {
  CARD_HEIGHT,
  CategoryCard,
  CategoryCardSkeleton,
} from "../components/category-card";
import { DEFAULT_CARD_PADDING } from "@/modules/shared/utils/constanst";
import { Typography } from "heroui-native/text";
import type { CategorySummary } from "@fludge/client/application/catalog/queries/use-find-categories";

interface Props {
  query: string;
}

const ITEM_SEPARATOR_HEIGHT = 16;

function renderCategoryItem({ item }: { item: CategorySummary }) {
  return <CategoryCard category={item} />;
}

function ListEmptyComponent() {
  return (
    <View className="items-center py-8">
      <Typography>No se encontraron categorías</Typography>
    </View>
  );
}

function ListFooterComponent({ hasNextPage }: { hasNextPage: boolean }) {
  if (!hasNextPage) {
    return (
      <View className="items-center py-4">
        <Typography>No hay más categorías</Typography>
      </View>
    );
  }

  return <CategoriesSectionSkeleton />;
}

export function CategoriesSection({ query }: Props) {
  const { data, fetchNextPage, hasNextPage, isLoading, isReady } =
    useFindCategories({ query });

  if (isLoading && !isReady) return <CategoriesSectionSkeleton length={10} />;

  return (
    <View className="flex-1">
      <FlatList
        className="flex-1 pb-1"
        data={data}
        contentContainerStyle={{ paddingBottom: 124 }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={renderCategoryItem}
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
        ListEmptyComponent={<ListEmptyComponent />}
      />
    </View>
  );
}

export function CategoriesSectionSkeleton({ length = 3 }: { length?: number }) {
  return (
    <View className="gap-y-4">
      {Array.from({ length }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </View>
  );
}
