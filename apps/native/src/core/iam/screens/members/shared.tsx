import { FlashList } from "@shopify/flash-list";
import { StyleSheet, View } from "react-native";

import { MemberCard } from "@/core/iam/components/member-card";
import { ThemedText } from "@/core/shared/components/themed-text";
import { SPACING } from "@/lib/sp";

import type { MembersListProps } from "./types";
import { useMembersListSection } from "./use-members-screen";

export function MemberListSection(props: MembersListProps) {
  const { state, texts } = useMembersListSection(props);

  return (
    <FlashList
      data={state.items}
      contentContainerStyle={styles.listContentContainer}
      showsVerticalScrollIndicator={false}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => <MemberCard member={item} />}
      ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <ThemedText>{texts.empty}</ThemedText>
        </View>
      }
    />
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
    paddingBottom: SPACING["5xl"],
    paddingTop: SPACING["3xl"],
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
