import {
  type GroupSummary,
  useFindAllGroups,
} from "@fludge/client/application/iam/organization/queries/use-find-groups";
import { FlatList, View } from "react-native";
import { SelectableGroupCard } from "../components/group-card";
import { useState } from "react";
import { Button } from "heroui-native/button";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { useToast } from "heroui-native";
import { useAssignGroupsToMember } from "@fludge/client/application/iam/organization/mutations/use-member.mutations";
import { useRouter } from "expo-router";
import { Typography } from "heroui-native/text";
import { SearchInput } from "@/modules/shared/components/search-input";
import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import type { TranslationKey } from "@fludge/i18n/index";

interface Props {
  memberId: string;
}

const ITEM_SEPARATOR_HEIGHT = 16;
const PADDING_BOTTOM = 16;

const TOAST_ID = "assign-groups-to-member-toast";

export function AssignGroupsToMember({ memberId }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const assignGroupsToMember = useAssignGroupsToMember();

  const { height } = useKeyboardGradualHeight(PADDING_BOTTOM);
  const { toast } = useToast();

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const { data: groups } = useFindAllGroups({
    query,
    byMember: {
      memberId,
      type: "exclude",
    },
  });

  const onSelectGroup = (group: GroupSummary) => {
    setSelectedGroups((prev) => {
      if (prev.includes(group.id)) return prev.filter((d) => d !== group.id);

      return [...prev, group.id];
    });
  };

  const isSelected = (group: GroupSummary) => selectedGroups.includes(group.id);

  const onAssignGroups = () => {
    if (selectedGroups.length === 0) return;
    toast.show({
      id: TOAST_ID,
      isSwipeable: true,
      label: t("mutations.members.assign_groups.is_pending"),
      description: t("helpers.please_wait"),
      duration: "persistent",
    });

    assignGroupsToMember.mutate(
      {
        memberId,
        groupIds: selectedGroups,
      },
      {
        onSuccess: () => {
          toast.show({
            id: TOAST_ID,
            isSwipeable: true,
            variant: "success",
            label: t("mutations.members.assign_groups.success.title"),
            description: t(
              "mutations.members.assign_groups.success.description"
            ),
            actionLabel: t("helpers.close"),
            onActionPress: ({ hide }) => hide(),
          });
          router.back();
        },
        onError: (error) => {
          toast.show({
            id: TOAST_ID,
            isSwipeable: true,
            variant: "danger",
            label: t("mutations.members.assign_groups.error"),
            description: t(error.message as TranslationKey),
            actionLabel: t("helpers.close"),
            onActionPress: ({ hide }) => hide(),
          });
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
        data={groups}
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
