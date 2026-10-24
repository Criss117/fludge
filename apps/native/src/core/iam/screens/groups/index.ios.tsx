import { Host } from "@expo/ui";
import { useFindAllGroups } from "@fludge/client/iam/queries/use-find-groups";
import { FlashList } from "@shopify/flash-list";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { GroupCard } from "@/core/iam/components/group-card";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { BaseTabScreen } from "@/core/shared/components/base-tab-screeen";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedText } from "@/core/shared/components/themed-text";
import { SPACING } from "@/lib/sp";

import { useGroupsScreen } from "./use-groups-screen";

function GroupsListSection({ searchQuery }: { searchQuery: string }) {
  const { t } = useTranslation();
  const { data } = useFindAllGroups({ searchQuery });

  return (
    <FlashList
      data={data}
      contentContainerStyle={styles.listContentContainer}
      showsVerticalScrollIndicator={false}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => <GroupCard group={item} />}
      ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <ThemedText>{t("screens.iam.groups.empty")}</ThemedText>
        </View>
      }
    />
  );
}

export function GroupsScreen() {
  const { actions, state, texts } = useGroupsScreen();

  return (
    <BaseTabScreen
      header={
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <SearchInput
            onValueChange={actions.setSearchQuery}
            label={texts.search.label}
            placeholder={texts.search.placeholder}
          />
        </Host>
      }
    >
      <View style={styles.listContainer}>
        <Suspense fallback={<BaseLoadingIndicator />}>
          <GroupsListSection searchQuery={state.searchQuery} />
        </Suspense>
      </View>
    </BaseTabScreen>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  listContentContainer: {
    paddingBottom: SPACING["5xl"],
    paddingTop: SPACING.md,
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
