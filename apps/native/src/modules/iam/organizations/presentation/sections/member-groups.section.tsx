import type { ActiveOrganization } from "@fludge/client/application/iam/organization/queries/use-find-organization";
import { Typography } from "heroui-native/text";
import { View } from "react-native";
import { GroupCardBase } from "../components/group-card";
import { useMemo, useState } from "react";
import { Input } from "heroui-native/input";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { Dialog } from "heroui-native/dialog";
import { Button } from "heroui-native/button";
import { useRemoveGroupsFromMember } from "@fludge/client/application/iam/organization/mutations/use-member.mutations";

interface Props {
  memberId: string;
  groups: (ActiveOrganization["groups"][number] & {
    tolalMembers: number;
  })[];
}

export function MemberGroupsSection({ groups, memberId }: Props) {
  const removeGroupsFromMember = useRemoveGroupsFromMember();
  const [groupToRemove, setGroupToRemove] = useState<
    (typeof groups)[number] | null
  >(null);
  const [query, setQuery] = useState("");

  const groupsFiltered = useMemo(() => {
    if (!query) return groups;

    return groups.filter((d) =>
      d.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [groups, query]);

  const onPressRemoveGroup = (groupId: string, close: () => void) => {
    const g = groups.find((d) => d.id === groupId);

    if (!g) return;

    setGroupToRemove(g);
    close();
  };

  const onRemoveGroup = () => {
    if (!groupToRemove) return;

    removeGroupsFromMember.mutate(
      {
        memberId: memberId,
        groupIds: [groupToRemove.id],
      },
      {
        onSuccess: () => {
          setGroupToRemove(null);
        },
      }
    );
  };

  return (
    <View className="gap-y-2">
      <View>
        <Typography.Heading type="h2">Grupos</Typography.Heading>
        <Typography.Paragraph color="muted">
          Roles y permisos heredados
        </Typography.Paragraph>
      </View>
      <View className="relative w-full flex-row items-center">
        <Input
          value={query}
          onChangeText={setQuery}
          className="flex-1 px-10"
          placeholder="Buscar grupos"
        />
        <View className="absolute left-4" pointerEvents="none">
          <MaterialIcons size={20} name="search" className="text-muted" />
        </View>
      </View>

      {groupsFiltered.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Typography.Paragraph color="muted">
            No hay grupos
          </Typography.Paragraph>
        </View>
      )}

      {groupsFiltered.map((g) => (
        <GroupCardBase
          key={g.id}
          group={g}
          asMemberGroup={{
            onPress: onPressRemoveGroup,
          }}
        />
      ))}

      <Dialog
        isOpen={groupToRemove !== null}
        onOpenChange={(v) => v === false && setGroupToRemove(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/50" />
          <Dialog.Content>
            <Dialog.Close className="absolute top-3 right-3 z-50" />
            <View>
              <Dialog.Title>Desasignar Grupo</Dialog.Title>
              <Dialog.Description>
                ¿Estás seguro de que deseas desasignar {groupToRemove?.name}?
              </Dialog.Description>
              <Dialog.Description>
                Los permisos heredados de este grupo se perderán.
              </Dialog.Description>
            </View>

            <View className="mt-4 flex-row gap-x-2">
              <Button
                className="flex-1"
                variant="outline"
                onPress={() => setGroupToRemove(null)}
                isDisabled={removeGroupsFromMember.isPending}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                isDisabled={removeGroupsFromMember.isPending}
                variant="danger-soft"
                onPress={onRemoveGroup}
              >
                Continuar
              </Button>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </View>
  );
}
