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
import { useTranslation } from "react-i18next";
import {
  CreateCategoryForm,
  UpdateCategoryForm,
} from "../components/category-form";
import { useState } from "react";
import { DeleteCategoryDialog } from "../components/delete-category-dialog";

interface Props {
  query: string;
}

const ITEM_SEPARATOR_HEIGHT = 16;

function ListEmptyComponent() {
  const { t } = useTranslation();

  return (
    <View className="items-center py-8">
      <Typography>{t("screens.categories.not_found")}</Typography>
    </View>
  );
}

function ListFooterComponent({ hasNextPage }: { hasNextPage: boolean }) {
  const { t } = useTranslation();

  if (!hasNextPage) {
    return (
      <View className="items-center py-4">
        <Typography>{t("screens.categories.no_more")}</Typography>
      </View>
    );
  }

  return <CategoriesSectionSkeleton />;
}

type SelectedCategory = {
  category: CategorySummary;
  action: "edit" | "delete";
};

export function CategoriesSection({ query }: Props) {
  const { data, fetchNextPage, hasNextPage, isLoading, isReady } =
    useFindCategories({ query });
  const [selectedCategory, setSelectedCategory] =
    useState<SelectedCategory | null>(null);

  if (isLoading && !isReady) return <CategoriesSectionSkeleton length={10} />;

  return (
    <View className="flex-1">
      <FlatList
        className="flex-1 pb-1"
        data={data}
        contentContainerStyle={{ paddingBottom: 124 }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            setSelectedCategory={setSelectedCategory}
          />
        )}
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
      <View className="absolute right-0 bottom-20">
        <CreateCategoryForm />
      </View>
      <DeleteCategoryDialog
        category={
          selectedCategory?.action === "delete"
            ? selectedCategory.category
            : null
        }
        onClose={() => setSelectedCategory(null)}
      />
      <UpdateCategoryForm
        category={
          selectedCategory?.action === "edit" ? selectedCategory.category : null
        }
        onClose={() => setSelectedCategory(null)}
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
