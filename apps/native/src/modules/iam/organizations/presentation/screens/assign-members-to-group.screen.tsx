import {
  type MemberSummary,
  useFindAllMembers,
} from "@fludge/client/application/iam/organization/queries/use-find-members";
import { useAssignMembersToGroup } from "@fludge/client/application/iam/organization/mutations/use-group.mutations";
import { useRouter } from "expo-router";
import { Button, useToast } from "heroui-native";
import { useState } from "react";
import { FlatList, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useKeyboardGradualHeight } from "@/modules/shared/hooks/use-keyboard-gradual-height";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { SearchInput } from "@/modules/shared/components/search-input";
import { Typography } from "heroui-native/text";
import { SelectableMemberCard } from "../components/member-card";
import {
  assignmentLabel,
  filterAssignableMembers,
  toggleSelection,
} from "../../../../shared/utils/assign-members-to-group.utils";

interface Props {
  groupId: string;
}

const ITEM_SEPARATOR_HEIGHT = 16;
const PADDING_BOTTOM = 16;
const TOAST_ID = "assign-members-to-group-toast";

export function AssignMembersToGroup({ groupId }: Props) {
  const router = useRouter();
  const assignMembersToGroup = useAssignMembersToGroup();
  const { height } = useKeyboardGradualHeight(PADDING_BOTTOM);
  const { toast } = useToast();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const { data: members } = useFindAllMembers({
    query,
    byGroup: { groupId, type: "exclude" },
  });
  const assignableMembers = filterAssignableMembers(members);

  const onSelectMember = (member: MemberSummary) => {
    setSelectedMemberIds((previous) => toggleSelection(previous, member.id));
  };

  const onAssignMembers = () => {
    if (selectedMemberIds.length === 0) return;

    toast.show({
      id: TOAST_ID,
      isSwipeable: true,
      label: "Asignando Miembros",
      description: "Por favor, espere...",
      duration: "persistent",
    });

    assignMembersToGroup.mutate(
      { groupId, memberIds: selectedMemberIds },
      {
        onSuccess: () => {
          toast.show({
            id: TOAST_ID,
            isSwipeable: true,
            variant: "success",
            label: "Miembros Asignados",
            description: "Los miembros se han asignado correctamente.",
            actionLabel: "Cerrar",
            onActionPress: ({ hide }) => hide(),
          });
          router.back();
        },
        onError: (error) => {
          toast.show({
            id: TOAST_ID,
            isSwipeable: true,
            variant: "danger",
            label: "Algo salió mal al asignar miembros",
            description: error.message,
            actionLabel: "Cerrar",
            onActionPress: ({ hide }) => hide(),
          });
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
        placeholder="Buscar Miembros"
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
              No hay miembros disponibles
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
            {assignmentLabel(selectedMemberIds.length)}
          </Button.Label>
        </Button>
        <Animated.View style={keyboardSpacer} />
      </View>
    </View>
  );
}
