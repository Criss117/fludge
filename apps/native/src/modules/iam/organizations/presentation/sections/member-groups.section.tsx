import { Typography } from "heroui-native/text";
import { View } from "react-native";
import { GroupCardBase } from "../components/group-card";
import { useState } from "react";
import { Dialog } from "heroui-native/dialog";
import { Button } from "heroui-native/button";
import { useRemoveGroupsFromMember } from "@fludge/client/application/iam/organization/mutations/use-member.mutations";
import {
  useFindAllGroups,
  type GroupSummary,
} from "@fludge/client/application/iam/organization/queries/use-find-groups";
import { SearchInput } from "@/modules/shared/components/search-input";
import { useTranslation } from "react-i18next";

interface Props {
  memberId: string;
}

export function MemberGroupsSection({ memberId }: Props) {
  const removeGroupsFromMember = useRemoveGroupsFromMember();
  const { t } = useTranslation();
  const [groupToRemove, setGroupToRemove] = useState<GroupSummary | null>(null);
  const [query, setQuery] = useState("");
  const { data: groups } = useFindAllGroups({
    query,
    byMember: {
      memberId,
      type: "include",
    },
  });

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
        <Typography.Heading type="h2">{t("screens.groups.title")}</Typography.Heading>
        <Typography.Paragraph color="muted">
          {t("helpers.inherited_roles_permissions")}
        </Typography.Paragraph>
      </View>
      <SearchInput
        query={query}
        setQuery={setQuery}
         placeholder="helpers.placeholder.search_groups"
      />

      {groups.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Typography.Paragraph color="muted">
             {t("helpers.no_groups")}
          </Typography.Paragraph>
        </View>
      )}

      {groups.map((g) => (
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
               <Dialog.Title>{t("helpers.unassign_group")}</Dialog.Title>
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
                 {t("helpers.cancel")}
              </Button>
              <Button
                className="flex-1"
                isDisabled={removeGroupsFromMember.isPending}
                variant="danger-soft"
                onPress={onRemoveGroup}
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
