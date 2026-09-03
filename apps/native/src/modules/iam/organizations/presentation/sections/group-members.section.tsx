import {
  type MemberSummary,
  useFindAllMembers,
} from "@fludge/client/application/iam/organization/queries/use-find-members";
import { Typography } from "heroui-native/text";
import { useState } from "react";
import { View } from "react-native";
import { MaterialIcons } from "@/modules/shared/components/icons";
import { SearchInput } from "@/modules/shared/components/search-input";
import { MemberCard } from "../components/member-card";
import { useRemoveMembersFromGroup } from "@fludge/client/application/iam/organization/mutations/use-group.mutations";
import { Dialog } from "heroui-native/dialog";
import { Button } from "heroui-native/button";
import { useTranslation } from "react-i18next";

export function GroupMembersSection({ groupId }: { groupId: string }) {
  const removeMembersFromGroup = useRemoveMembersFromGroup();
  const { t } = useTranslation();
  const [memberToRemove, setMemberToRemove] = useState<MemberSummary | null>(
    null
  );
  const [query, setQuery] = useState("");
  const { data: members } = useFindAllMembers({
    byGroup: {
      groupId: groupId,
      type: "include",
    },
    query,
  });

  const onPressRemoveMember = (memberId: string, close: () => void) => {
    const m = members.find((d) => d.id === memberId);

    if (!m) return;

    setMemberToRemove(m);
    close();
  };

  const onRemoveMember = () => {
    if (!memberToRemove) return;

    removeMembersFromGroup.mutate(
      {
        groupId: groupId,
        memberIds: [memberToRemove.id],
      },
      {
        onSuccess: () => {
          setMemberToRemove(null);
        },
      }
    );
  };

  return (
    <View className="flex-1 gap-y-2">
      <SearchInput
        query={query}
        setQuery={setQuery}
         placeholder="helpers.placeholder.search_members"
      />
      {members.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <MaterialIcons name="info" size={20} className="text-muted" />
          <Typography.Paragraph color="muted">
             {t("helpers.no_members")}
          </Typography.Paragraph>
        </View>
      ) : (
        <View className="gap-y-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              asGroupMember={{
                onPress: onPressRemoveMember,
              }}
            />
          ))}
        </View>
      )}

      <Dialog
        isOpen={memberToRemove !== null}
        onOpenChange={(v) => v === false && setMemberToRemove(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/50" />
          <Dialog.Content>
            <Dialog.Close className="absolute top-3 right-3 z-50" />
            <View>
             <Dialog.Title>{t("helpers.unassign_member")}</Dialog.Title>
              <Dialog.Description>
                ¿Estás seguro de que deseas desasignar{" "}
                {memberToRemove?.user.name}?
              </Dialog.Description>
              <Dialog.Description>
                El miembro perderá los permisos heredados.
              </Dialog.Description>
            </View>

            <View className="mt-4 flex-row gap-x-2">
              <Button
                className="flex-1"
                variant="outline"
                onPress={() => setMemberToRemove(null)}
                isDisabled={removeMembersFromGroup.isPending}
              >
                 {t("helpers.cancel")}
              </Button>
              <Button
                className="flex-1"
                isDisabled={removeMembersFromGroup.isPending}
                variant="danger-soft"
                onPress={onRemoveMember}
              >
                 {t("helpers.continue")}
              </Button>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </View>
  );
}
