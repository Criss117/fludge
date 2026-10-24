import { Host } from "@expo/ui/jetpack-compose";
import { Suspense } from "react";
import { StyleSheet, View } from "react-native";

import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { SearchInput } from "@/core/shared/components/text-input";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";

import { MemberListSection } from "./shared";
import { useMembersScreen } from "./use-members-screen";

export function MembersScreen() {
  const { actions, state, texts } = useMembersScreen();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <SearchInput
            onValueChange={actions.setSearchQuery}
            label={texts.search.label}
            placeholder={texts.search.placeholder}
          />
        </Host>
      </View>

      <View style={styles.listContainer}>
        <Suspense fallback={<BaseLoadingIndicator />}>
          <MemberListSection searchQuery={state.searchQuery} />
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
