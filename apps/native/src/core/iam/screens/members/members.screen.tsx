import { MemberListSection } from "@/core/iam/sections/member-list";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";
import { Host } from "@expo/ui";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { Suspense, useState } from "react";
import { StyleSheet, View } from "react-native";

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

      <LinkFabButton
        action={{ type: "push", href: "/dashboard/members/register" }}
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
