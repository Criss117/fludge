import { Host } from "@expo/ui";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { useFindAllMembers } from "@fludge/client/iam/queries/use-find-members";
import { FlashList } from "@shopify/flash-list";
import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { MemberCard } from "@/core/iam/components/member-card";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";

interface Props {
  searchQuery: string;
}

export function MemberListSection({ searchQuery }: Props) {
  const { t } = useTranslation();
  const { data } = useFindAllMembers({
    searchQuery,
  });

  return (
    <FlashList
      data={data}
      contentContainerStyle={styles.listContentContainer}
      showsVerticalScrollIndicator={false}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => <MemberCard member={item} />}
      ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <ThemedText>{t("screens.iam.members.empty")}</ThemedText>
        </View>
      }
    />
  );
}

export function MembersScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <TextInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            label="screens.iam.members.search.label"
            placeholder="screens.iam.members.search.placeholder"
            modifiers={[fillMaxWidth()]}
            iconName="search"
          />
        </Host>
      </View>

      <View style={styles.listContainer}>
        <Suspense fallback={<BaseLoadingIndicator />}>
          <MemberListSection searchQuery={searchQuery} />
        </Suspense>
      </View>

      <LinkFabButton action={{ type: "push", href: "/dashboard/members/register" }} />
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
  listContentContainer: {
    paddingBottom: SPACING["3xl"],
    paddingTop: SPACING.md,
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
