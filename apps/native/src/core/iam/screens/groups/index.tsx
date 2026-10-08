import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";
import { Host } from "@expo/ui";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { Suspense, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { useTranslation } from "react-i18next";
import { useFindAllGroups } from "@fludge/client/iam/queries/use-find-groups";
import { FlashList } from "@shopify/flash-list";
import { GroupCard } from "@/core/iam/components/group-card";
import { ThemedText } from "@/core/shared/components/themed-text";

function GroupsListSection({ searchQuery }: { searchQuery: string }) {
  const { t } = useTranslation();

  const { data } = useFindAllGroups({
    searchQuery,
  });

  return (
    <FlashList
      data={data}
      contentContainerStyle={groupListStyles.container}
      showsVerticalScrollIndicator={false}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => <GroupCard group={item} />}
      ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
      ListEmptyComponent={
        <View style={groupListStyles.listEmptyContainer}>
          <ThemedText>{t("screens.iam.groups.empty")}</ThemedText>
        </View>
      }
    />
  );
}

const groupListStyles = StyleSheet.create({
  container: {
    paddingBottom: SPACING["3xl"],
    paddingTop: SPACING.md,
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export function GroupsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <TextInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            label="screens.iam.groups.search.label"
            placeholder="screens.iam.groups.search.placeholder"
            modifiers={[fillMaxWidth()]}
            iconName="search"
            withDebounce={800}
          />
        </Host>
      </View>

      <View style={styles.listContainer}>
        <Suspense fallback={<BaseLoadingIndicator />}>
          <GroupsListSection searchQuery={searchQuery} />
        </Suspense>
      </View>

      <LinkFabButton
        action={{ type: "push", href: "/dashboard/groups/create" }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    position: "relative",
  },
  headerContainer: {
    paddingHorizontal: SPACING.sm,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
});
