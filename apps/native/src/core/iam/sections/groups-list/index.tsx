import { SPACING } from "@/lib/sp";
import { FlashList } from "@shopify/flash-list";
import { StyleSheet, View } from "react-native";
import { useFindAllGroups } from "@fludge/client/iam/queries/use-find-groups";
import { GroupCard } from "@/core/iam/components/group-card";
import { ThemedText } from "@/core/shared/components/themed-text";
import { useTranslation } from "react-i18next";
import { Host, LoadingIndicator } from "@expo/ui/jetpack-compose";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

interface Props {
  searchQuery: string;
}

export function GroupsListSection({ searchQuery }: Props) {
  const { t } = useTranslation();

  const { data } = useFindAllGroups({
    searchQuery,
  });

  return (
    <FlashList
      data={data}
      contentContainerStyle={styles.container}
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
