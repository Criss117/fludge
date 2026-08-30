import { useRemoveMembersFromGroup } from "@fludge/client/application/iam/organization/mutations/use-group.mutations";
import {
  type MemberSummary,
  useFindAllMembers,
} from "@fludge/client/application/iam/organization/queries/use-find-members";
import { Button } from "heroui-native/button";
import { Dialog } from "heroui-native/dialog";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { SearchInput } from "@/modules/shared/components/search-input";
import { MemberCardBase, CARD_HEIGHT } from "../components/member-card";

const ITEM_SEPARATOR_HEIGHT = 16;

export function GroupMembersSection({ groupId }: { groupId: string }) {
  const [query, setQuery] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<MemberSummary | null>(
    null
  );
  const removeMembers = useRemoveMembersFromGroup();
  const { data: members } = useFindAllMembers({ byGroupId: groupId, query });

  const onRemoveMember = () => {
    if (!memberToRemove) return;
    removeMembers.mutate(
      { groupId, memberIds: [memberToRemove.id] },
      { onSuccess: () => setMemberToRemove(null) }
    );
  };

  return (
    <View className="flex-1 gap-y-2">
      <SearchInput
        query={query}
        setQuery={setQuery}
        placeholder="Buscar Miembros"
      />
      <FlatList
        data={members}
        className="flex-1"
        keyExtractor={(member) => member.id}
        ItemSeparatorComponent={
          <View style={{ height: ITEM_SEPARATOR_HEIGHT }} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        getItemLayout={(_, index) => ({
          length: CARD_HEIGHT,
          offset: (CARD_HEIGHT + ITEM_SEPARATOR_HEIGHT) * index,
          index,
        })}
        renderItem={({ item }) =>
          item.role === "owner" ? (
            <MemberCardBase member={item} hideOptions />
          ) : (
            <MemberCardBase
              member={item}
              hideOptions
              onRemove={() => setMemberToRemove(item)}
            />
          )
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-12">
            <MaterialIcons name="info" size={20} className="text-muted" />
            <Typography.Paragraph color="muted">
              No hay miembros
            </Typography.Paragraph>
          </View>
        }
      />
      <Dialog
        isOpen={memberToRemove !== null}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/50" />
          <Dialog.Content>
            <Dialog.Close className="absolute top-3 right-3 z-50" />
            <Dialog.Title>Desasignar Miembro</Dialog.Title>
            <Dialog.Description>
              ¿Estás seguro de que deseas desasignar {memberToRemove?.user.name}
              ?
            </Dialog.Description>
            <View className="mt-4 flex-row gap-x-2">
              <Button
                className="flex-1"
                variant="outline"
                onPress={() => setMemberToRemove(null)}
                isDisabled={removeMembers.isPending}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                variant="danger-soft"
                onPress={onRemoveMember}
                isDisabled={removeMembers.isPending}
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
