import { useFindAllMembers } from "@fludge/client/application/iam/queries/use-find-members";
import { useAssignMembersToGroup } from "@fludge/client/application/iam/mutations/use-group.mutations";
import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { useState } from "react";
import { FlatList, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { SearchInput } from "@/modules/shared/components/search-input";
import { Typography } from "heroui-native/text";
import { SelectableMemberCard } from "../components/member-card";
import {
  filterAssignableMembers,
  toggleSelection,
} from "@/modules/shared/utils/assign-members-to-group.utils";
import { useTranslation } from "react-i18next";
import type { TranslationKey } from "@fludge/i18n/index";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { GroupDetail } from "@fludge/client/application/iam/domain/group.repository";
import type { MemberSummary } from "@fludge/client/application/iam/domain/member.repository";

interface Props {
  group: GroupDetail;
}

const ITEM_SEPARATOR_HEIGHT = 16;
const PADDING_BOTTOM = 16;

export function AssignMembersToGroup({ group }: Props) {
  const { t } = useTranslation();
  const mutationToast = useMutationToast("assign-members-to-group-toast");
  const router = useRouter();
  const assignMembersToGroup = useAssignMembersToGroup();
  const { height } = useKeyboardGradualHeight(PADDING_BOTTOM);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const { data: members } = useFindAllMembers({
    searchQuery: query,
    excludeIds: group.members.map((m) => m.id),
  });

  const assignableMembers = filterAssignableMembers(members);

  const onSelectMember = (member: MemberSummary) => {
    setSelectedMemberIds((previous) => toggleSelection(previous, member.id));
  };

  const onAssignMembers = () => {
    if (selectedMemberIds.length === 0) return;

    mutationToast.showIsPendingToast(
      "mutations.groups.assign_members.is_pending"
    );

    assignMembersToGroup.mutate(
      { groupId: group.id, memberIds: selectedMemberIds },
      {
        onSuccess: () => {
          mutationToast.showSuccessToast(
            "mutations.groups.assign_members.success.title",
            "mutations.groups.assign_members.success.description"
          );
          router.back();
        },
        onError: (error) => {
          mutationToast.showErrorToast(
            "mutations.groups.assign_members.error",
            error.message as TranslationKey
          );
        },
      }
    );
  };

  const keyboardSpacer = useAnimatedStyle(() => {
    const keyboardHeight = height.get();

    return { height: Math.abs(keyboardHeight) };
  });

  return (
    <View className="flex-1 gap-y-4 px-3">
      <SearchInput
        query={query}
        setQuery={setQuery}
        placeholder="helpers.placeholder.search_members"
      />
      <FlatList
        data={assignableMembers}
        className="flex-1 pb-1"
        renderItem={({ item }) => (
          <SelectableMemberCard
            member={item}
            onPress={onSelectMember}
            isSelected={selectedMemberIds.includes(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={
          <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <MaterialIcons
              name="info"
              size={20}
              className="text-muted"
              style={{ marginBottom: 16 }}
            />
            <Typography.Paragraph color="muted">
              {t("screens.members.no_available")}
            </Typography.Paragraph>
          </View>
        }
      />
      <View className="pt-2 pb-4">
        <Button
          isDisabled={selectedMemberIds.length === 0}
          onPress={onAssignMembers}
        >
          <MaterialIcons
            name="add-circle-outline"
            size={20}
            className="text-eclipse"
          />
          <Button.Label>
            {t("helpers.assign")} {selectedMemberIds.length}{" "}
            {t("screens.members.title")}
          </Button.Label>
        </Button>
        <Animated.View style={keyboardSpacer} />
      </View>
    </View>
  );
}
