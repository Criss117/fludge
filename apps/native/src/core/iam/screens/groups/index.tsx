import { LinkFabButton } from "@/core/shared/components/link-fab-button";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedView } from "@/core/shared/components/themed-view";
import { SPACING } from "@/lib/sp";
import { Host } from "@expo/ui";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { Suspense, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GroupsListSection } from "@/core/iam/sections/groups-list";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";

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
