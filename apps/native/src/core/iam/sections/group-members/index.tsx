import { Host } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import type { GroupDetail, MemberSummary } from "@fludge/client/iam/domain/entities";
import { useRemoveMembersFromGroup } from "@fludge/client/iam/mutations/use-group.mutations";
import type { TranslationKey } from "@fludge/i18n/index";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { MemberCard } from "@/core/iam/components/member-card";
import { TextInput } from "@/core/shared/components/text-input";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";

interface Props {
  group: GroupDetail;
}

export function GroupMembersSection({ group }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const removeMembersFromGroup = useRemoveMembersFromGroup();
  const mutationToast = useMutationToast();

  const members = useMemo(() => {
    return group.members.filter((m) =>
      m.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [group, searchQuery]);

  const onRemoveMember = useCallback(
    (member: MemberSummary) => {
      mutationToast.showPending("forms.group.unassign_members.pending");
      removeMembersFromGroup.mutate(
        {
          groupId: group.id,
          memberIds: [member.id],
        },
        {
          onSuccess: () => {
            mutationToast.showSuccess("forms.group.unassign_members.success");
          },
          onError: (e) => {
            mutationToast.showError(
              "forms.group.unassign_members.error",
              e.message as TranslationKey,
            );
          },
        },
      );
    },
    [group, removeMembersFromGroup, mutationToast],
  );

  return (
    <View style={styles.container}>
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <TextInput
          defaultValue={searchQuery}
          onValueChange={setSearchQuery}
          modifiers={[fillMaxWidth()]}
          iconName="search"
          maxLines={1}
          label="screens.iam.members.search.label"
          placeholder="screens.iam.members.search.placeholder"
        />
      </Host>

      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          menuOptions={{
            items: [
              {
                action: () => onRemoveMember(member),
                label: "screens.groups.detail.unassign",
                icon: "block",
                color: "error",
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    rowGap: SPACING.sm,
  },
});
