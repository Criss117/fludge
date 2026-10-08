import { TextInput } from "@/core/shared/components/text-input";
import {
  ThemedNativeText,
  ThemedText,
} from "@/core/shared/components/themed-text";
import { SPACING } from "@/lib/sp";
import { Button, Host, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, width } from "@expo/ui/jetpack-compose/modifiers";
import type { MemberDetail } from "@fludge/client/iam/domain/entities";
import { useFindAllGroups } from "@fludge/client/iam/queries/use-find-groups";
import { FlashList } from "@shopify/flash-list";
import { StyleSheet, View } from "react-native";
import {
  GroupCard,
  SelectableGroupCard,
} from "@/core/iam/components/group-card";
import { useTranslation } from "react-i18next";
import { Suspense, useState } from "react";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { ThemedView } from "@/core/shared/components/themed-view";
import { Icon } from "@/core/shared/components/icon";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { useKeyboardSpacer } from "@/core/shared/hooks/use-keyboard-spacer";
import Animated from "react-native-reanimated";
import { useAssignGroupsToMember } from "@fludge/client/iam/mutations/use-member.mutations";
import { useToast } from "@/core/shared/components/toast-provider";
import { useRouter } from "expo-router";
import type { TranslationKey } from "@fludge/i18n/index";

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

  const { t } = useTranslation();
  const assignGroupsToMember = useAssignGroupsToMember();
  const toast = useToast();
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
    assignGroupsToMember.mutate(
      {
        memberId: member.id,
        groupIds: seletedGroupIds,
      },
      {
        onSuccess: () => {
          toast.show({
            message: "forms.member.success.assing_groups",
          });
          router.back();
          setSelectedGroupIds([]);
        },
        onError: (e) => {
          toast.show({
            message: e.message as TranslationKey,
          });
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
              {t("forms.member.assign_groups", {
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
