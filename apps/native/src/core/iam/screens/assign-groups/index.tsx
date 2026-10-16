import { Button, Host, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, width } from "@expo/ui/jetpack-compose/modifiers";
import type { MemberDetail } from "@fludge/client/iam/domain/entities";
import { useAssignGroupsToMember } from "@fludge/client/iam/mutations/use-member.mutations";
import { useFindAllGroups } from "@fludge/client/iam/queries/use-find-groups";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { SelectableGroupCard } from "@/core/iam/components/group-card";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { Icon } from "@/core/shared/components/icon";
import { TextInput } from "@/core/shared/components/text-input";
import { ThemedNativeText, ThemedText } from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useKeyboardSpacer } from "@/core/shared/hooks/use-keyboard-spacer";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";

interface Props {
  member: MemberDetail;
}

function List({
  groupIds,
  searchQuery,
  selectedGroupIds,
  onSelectGroup,
}: {
  groupIds: string[];
  searchQuery: string;
  selectedGroupIds: string[];
  onSelectGroup: (groupId: string) => void;
}) {
  const { t } = useTranslation();
  const { data } = useFindAllGroups({
    excludeIds: groupIds,
    searchQuery,
  });

  return (
    <FlashList
      data={data}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => (
        <SelectableGroupCard
          menuOptions={{
            hide: true,
          }}
          group={item}
          isSelected={selectedGroupIds.includes(item.id)}
          onPress={(g) => onSelectGroup(g.id)}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <ThemedText>{t("screens.iam.groups.empty")}</ThemedText>
        </View>
      }
    />
  );
}

export function AssignGroupsScreen({ member }: Props) {
  const [seletedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const mutationToast = useMutationToast();

  const { t } = useTranslation();
  const assignGroupsToMember = useAssignGroupsToMember();
  const router = useRouter();
  const colors = useThemeColor();
  const spacer = useKeyboardSpacer();

  const groupIds = member.groups.map((group) => group.id);

  const onSelectGroup = (groupId: string) => {
    setSelectedGroupIds((ids) => {
      if (ids.includes(groupId)) {
        return ids.filter((id) => id !== groupId);
      } else {
        return [...ids, groupId];
      }
    });
  };

  const onAssignGroups = () => {
    mutationToast.showPending("forms.member.assing_groups.pending");
    assignGroupsToMember.mutate(
      {
        memberId: member.id,
        groupIds: seletedGroupIds,
      },
      {
        onSuccess: () => {
          router.back();
          mutationToast.showSuccess("forms.member.assing_groups.success");
          setSelectedGroupIds([]);
        },
        onError: (_e) => {
          mutationToast.showError("forms.member.assing_groups.error");
        },
      },
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <TextInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            iconName="search"
            modifiers={[fillMaxWidth()]}
            label="screens.iam.groups.search.label"
            placeholder="screens.iam.groups.search.placeholder"
          />
        </Host>
      </View>
      <Suspense fallback={<BaseLoadingIndicator />}>
        <List
          groupIds={groupIds}
          searchQuery={searchQuery}
          selectedGroupIds={seletedGroupIds}
          onSelectGroup={onSelectGroup}
        />
      </Suspense>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
            enabled={seletedGroupIds.length > 0}
            onClick={onAssignGroups}
          >
            <Icon name="add" color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>
              {t("forms.member.assing_groups.submit", {
                quantity: seletedGroupIds.length,
              })}
            </ThemedNativeText>
          </Button>
        </Host>
        <Animated.View style={spacer} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
  },
  contentContainer: {
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  headerContainer: {
    paddingHorizontal: SPACING.sm,
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.md,
  },
});
