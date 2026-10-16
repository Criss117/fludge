import { Host } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import type { CategorySummary } from "@fludge/client/catalog/domain/category.repository";
import { useToggleCategoryStatusMutation } from "@fludge/client/catalog/mutations/use-category.mutations";
import { useFindCategories } from "@fludge/client/catalog/queries/use-find-categories";
import type { TranslationKey } from "@fludge/i18n/index";
import { FlashList } from "@shopify/flash-list";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { CategoryCard } from "@/core/catalog/components/category-card";
import { CreateCategoryForm } from "@/core/catalog/components/create-category-form";
import { UpdateCategoryForm } from "@/core/catalog/components/update-category-form";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";

interface ListFooterProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

function ListFooterComponent({ hasNextPage, isFetchingNextPage }: ListFooterProps) {
  const { t } = useTranslation();

  if (!hasNextPage)
    return (
      <View style={styles.listEmptyContainer}>
        <ThemedText>{t("screens.catalog.categories.no_more")}</ThemedText>
      </View>
    );

  if (isFetchingNextPage) return <BaseLoadingIndicator />;

  return null;
}

function ListEmptyComponent() {
  const { t } = useTranslation();

  return (
    <View style={styles.listEmptyContainer}>
      <ThemedText>{t("screens.catalog.categories.empty")}</ThemedText>
    </View>
  );
}

const ItemSeparator = () => <View style={{ height: SPACING.sm }} />;

function CategoriesList({
  searchQuery,
  onUpdate,
  onToggleStatus,
}: {
  searchQuery: string;
  onUpdate: (category: CategorySummary) => void;
  onToggleStatus: (category: CategorySummary) => void;
}) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useFindCategories({
    searchQuery,
  });

  const items = useMemo(() => data.pages.flatMap((page) => page.items), [data.pages]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <FlashList
      data={items}
      contentContainerStyle={styles.listContentContainer}
      keyExtractor={(i) => i.id}
      renderItem={({ item }) => (
        <CategoryCard category={item} onUpdate={onUpdate} onToggleStatus={onToggleStatus} />
      )}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={() => (
        <ListFooterComponent hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />
      )}
      onEndReachedThreshold={0.3}
      onEndReached={handleEndReached}
    />
  );
}

export function CategoriesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategorySummary | null>(null);
  const mutationToast = useMutationToast();
  const toggleStatus = useToggleCategoryStatusMutation();

  const handleToggleStatus = (category: CategorySummary) => {
    mutationToast.showPending("mutations.categories.update.is_pending");

    toggleStatus.mutate(
      { id: category.id },
      {
        onSuccess: () => {
          mutationToast.showSuccess("mutations.categories.update.success.title");
        },
        onError: (error) => {
          mutationToast.showError(
            "mutations.categories.update.error",
            error.message as TranslationKey,
          );
        },
      },
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <TextInput
            modifiers={[fillMaxWidth()]}
            onValueChange={setSearchQuery}
            iconName="search"
            label="screens.catalog.categories.search.label"
            placeholder="screens.catalog.categories.search.placeholder"
          />
        </Host>
      </View>

      <View style={styles.listContainer}>
        <Suspense fallback={<BaseLoadingIndicator />}>
          <CategoriesList
            searchQuery={searchQuery}
            onUpdate={setSelectedCategory}
            onToggleStatus={handleToggleStatus}
          />
        </Suspense>
      </View>

      <CreateCategoryForm />

      {selectedCategory && (
        <UpdateCategoryForm category={selectedCategory} onClose={() => setSelectedCategory(null)} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  header: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  listContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.md,
    paddingBottom: SPACING["3xl"],
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
