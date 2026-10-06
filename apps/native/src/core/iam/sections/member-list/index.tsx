import { SPACING } from "@/lib/sp";
import { useFindAllMembers } from "@fludge/client/iam/queries/use-find-members";
import { FlashList } from "@shopify/flash-list";
import { StyleSheet, View } from "react-native";
import { MemberCard } from "@/core/iam/components/member-card";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useTranslation } from "react-i18next";

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
      contentContainerStyle={styles.container}
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

const styles = StyleSheet.create({
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
