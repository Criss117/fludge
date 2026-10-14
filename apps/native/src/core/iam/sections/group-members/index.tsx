import { TextInput } from "@/core/shared/components/text-input";
import { SPACING } from "@/lib/sp";
import { Host } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import type {
  GroupDetail,
  MemberSummary,
} from "@fludge/client/iam/domain/entities";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { MemberCard } from "@/core/iam/components/member-card";
import { useRemoveMembersFromGroup } from "@fludge/client/iam/mutations/use-group.mutations";
import { useMutationToast } from "@/integrations/toast";

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
          onError: () => {
            mutationToast.showError("forms.group.unassign_members.error");
          },
        },
      );
    },
    [group],
  );

  return (
    <View style={styles.container}>
      <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
        <TextInput
          value={searchQuery}
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
