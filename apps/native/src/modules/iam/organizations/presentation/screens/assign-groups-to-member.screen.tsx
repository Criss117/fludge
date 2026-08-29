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

interface Props {
  memberId: string;
}

const ITEM_SEPARATOR_HEIGHT = 16;

const TOAST_ID = "assign-groups-to-member-toast";

export function AssignGroupsToMember({ memberId }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const assignGroupsToMember = useAssignGroupsToMember();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const { data: groups } = useFindAllGroups({
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
      label: "Asignando Grupos",
      description: "Por favor, espere...",
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
            label: "Grupos Asignados",
            description: "Los grupos se han asignado correctamente.",
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
            label: "Algo salió mal al asignar grupos",
            description: error.message,
            actionLabel: "Cerrar",
            onActionPress: ({ hide }) => hide(),
          });
        },
      }
    );
  };

  return (
    <View className="flex-1 px-3">
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
              No hay grupos disponibles
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
          <Button.Label>Asignar Grupos</Button.Label>
        </Button>
      </View>
    </View>
  );
}
