import { FlatList, View } from "react-native";
import { SelectableGroupCard } from "../components/group-card";
import { useState } from "react";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useAssignGroupsToMember } from "@fludge/client/application/iam/mutations/use-member.mutations";
import { useRouter } from "expo-router";
import { Typography } from "heroui-native/text";
import { SearchInput } from "@/modules/shared/components/search-input";
import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import type { TranslationKey } from "@fludge/i18n/index";
import { useMutationToast } from "@/modules/shared/hooks/use-mutation-toast";
import type { MemberDetail } from "@fludge/client/application/iam/domain/member.repository";
import { GroupSummary } from "@fludge/client/application/iam/domain/group.repository";

interface Props {
  member: MemberDetail;
}

const ITEM_SEPARATOR_HEIGHT = 16;
const PADDING_BOTTOM = 16;

export function AssignGroupsToMember({ member }: Props) {
  const mutationToast = useMutationToast("assign-groups-to-member-toast");
  const { t } = useTranslation();
  const router = useRouter();
  const assignGroupsToMember = useAssignGroupsToMember();

  const { height } = useKeyboardGradualHeight(PADDING_BOTTOM);

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const onSelectGroup = (group: GroupSummary) => {
    setSelectedGroups((prev) => {
      if (prev.includes(group.id)) return prev.filter((d) => d !== group.id);

      return [...prev, group.id];
    });
  };

  const isSelected = (group: GroupSummary) => selectedGroups.includes(group.id);

  const onAssignGroups = () => {
    if (selectedGroups.length === 0) return;
    mutationToast.showIsPendingToast(
      "mutations.members.assign_groups.is_pending"
    );

    assignGroupsToMember.mutate(
      {
        memberId: member.id,
        groupIds: selectedGroups,
      },
      {
        onSuccess: () => {
          mutationToast.showSuccessToast(
            "mutations.members.assign_groups.success.title",
            "mutations.members.assign_groups.success.description"
          );
          router.back();
        },
        onError: (error) => {
          mutationToast.showErrorToast(
            "mutations.members.assign_groups.error",
            error.message as TranslationKey
          );
        },
      }
    );
  };

  const fakeView = useAnimatedStyle(() => {
    const keyboardHeight = height.get();

    return {
      height: Math.abs(keyboardHeight),
    };
  });

  return (
    <View className="flex-1 gap-y-4 px-3">
      <SearchInput
        query={query}
        setQuery={setQuery}
        placeholder="helpers.placeholder.search_groups"
      />
      <FlatList
        data={member.groups}
        className="flex-1 pb-1"
        renderItem={({ item }) => (
          <SelectableGroupCard
            group={item}
            onPress={onSelectGroup}
            isSelected={isSelected(item)}
          />
        )}
        keyExtractor={(d) => d.id}
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
              {t("screens.groups.no_available")}
            </Typography.Paragraph>
          </View>
        }
      />

      <View className="pt-2 pb-4">
        <Button
          isDisabled={selectedGroups.length === 0}
          onPress={onAssignGroups}
        >
          <MaterialIcons
            name="add-circle-outline"
            size={20}
            className="text-eclipse"
          />
          <Button.Label>
            {t("helpers.assign")} {selectedGroups.length}{" "}
            {t("screens.groups.title")}
          </Button.Label>
        </Button>
        <Animated.View style={fakeView} />
      </View>
    </View>
  );
}
