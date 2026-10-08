import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { Icon } from "@/core/shared/components/icon";
import { TextInput } from "@/core/shared/components/text-input";
import {
  ThemedNativeText,
  ThemedText,
} from "@/core/shared/components/themed-text";
import { ThemedView } from "@/core/shared/components/themed-view";
import { useToast } from "@/core/shared/components/toast-provider";
import { useKeyboardSpacer } from "@/core/shared/hooks/use-keyboard-spacer";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";
import { Button, Host, Spacer } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, width } from "@expo/ui/jetpack-compose/modifiers";
import type { GroupDetail } from "@fludge/client/iam/domain/entities";
import { useAssignMembersToGroup } from "@fludge/client/iam/mutations/use-group.mutations";
import { useFindAllMembers } from "@fludge/client/iam/queries/use-find-members";
import type { TranslationKey } from "@fludge/i18n/index";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { SelectableMemberCard } from "@/core/iam/components/member-card";

interface Props {
  group: GroupDetail;
}

function List({
  memberIds,
  searchQuery,
  selectedMemberIds,
  onSelectMember,
}: {
  memberIds: string[];
  searchQuery: string;
  selectedMemberIds: string[];
  onSelectMember: (groupId: string) => void;
}) {
  const { t } = useTranslation();
  const { data } = useFindAllMembers({
    excludeIds: memberIds,
    searchQuery,
  });

  return (
    <FlashList
      data={data}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => (
        <SelectableMemberCard
          menuOptions={{
            hide: true,
          }}
          member={item}
          isSelected={selectedMemberIds.includes(item.id)}
          onPress={(m) => onSelectMember(m.id)}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <ThemedText>{t("screens.iam.members.empty")}</ThemedText>
        </View>
      }
    />
  );
}

export function AssignMembersScreen({ group }: Props) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const assignMembersToGroup = useAssignMembersToGroup();
  const toast = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();
  const spacer = useKeyboardSpacer();

  const memberIds = group.members.map((member) => member.id);

  const onSelectMember = (memberId: string) => {
    setSelectedMemberIds((ids) => {
      if (ids.includes(memberId)) {
        return ids.filter((id) => id !== memberId);
      } else {
        return [...ids, memberId];
      }
    });
  };

  const onAssignMembers = () => {
    assignMembersToGroup.mutate(
      {
        groupId: group.id,
        memberIds: selectedMemberIds,
      },
      {
        onSuccess: () => {
          toast.show({
            message: "forms.member.success.assing_groups",
          });
          router.back();
          setSelectedMemberIds([]);
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
            label="screens.iam.members.search.label"
            placeholder="screens.iam.members.search.placeholder"
          />
        </Host>
      </View>
      <Suspense fallback={<BaseLoadingIndicator />}>
        <List
          memberIds={memberIds}
          searchQuery={searchQuery}
          selectedMemberIds={selectedMemberIds}
          onSelectMember={onSelectMember}
        />
      </Suspense>
      <View style={styles.footer}>
        <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
          <Button
            colors={{
              containerColor: colors.primary,
            }}
            enabled={selectedMemberIds.length > 0}
            onClick={onAssignMembers}
          >
            <Icon name="add" color={colors.onPrimary} />
            <Spacer modifiers={[width(SPACING.sm)]} />
            <ThemedNativeText color={colors.onPrimary}>
              {t("forms.group.assign_members", {
                quantity: selectedMemberIds.length,
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
