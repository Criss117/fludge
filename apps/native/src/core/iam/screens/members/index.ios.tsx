import { Host } from "@expo/ui/swift-ui";
import { Suspense } from "react";
import { StyleSheet, View } from "react-native";

import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { BaseTabScreen } from "@/core/shared/components/base-tab-screeen";
import { SearchInput } from "@/core/shared/components/text-input";
import { SPACING } from "@/lib/sp";

import { MemberListSection } from "./shared";
import { useMembersScreen } from "./use-members-screen";

export function MembersScreen() {
  const { actions, state, texts } = useMembersScreen();

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
          <MemberListSection searchQuery={state.searchQuery} />
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
});
