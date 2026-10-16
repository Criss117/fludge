import { Host } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import type { GroupSummary, MemberDetail } from "@fludge/client/iam/domain/entities";
import { useRemoveGroupsFromMember } from "@fludge/client/iam/mutations/use-member.mutations";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { GroupCard } from "@/core/iam/components/group-card";
import { TextInput } from "@/core/shared/components/text-input";
import { useMutationToast } from "@/integrations/toast";
import { SPACING } from "@/lib/sp";

interface Props {
  member: MemberDetail;
}

export function MemberGroupsSection({ member }: Props) {
  const removeGroupsFromMember = useRemoveGroupsFromMember();
  const [searchQuery, setSearchQuery] = useState("");
  const mutationToast = useMutationToast();

  const groups = useMemo(() => {
    return member.groups.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [member, searchQuery]);

  const onRemoveGroup = useCallback(
    (group: GroupSummary) => {
      mutationToast.showPending("forms.member.unassign_groups.pending");
      removeGroupsFromMember.mutate(
        {
          memberId: member.id,
          groupIds: [group.id],
        },
        {
          onSuccess: () => {
            mutationToast.showSuccess("forms.member.unassign_groups.success");
          },
          onError: () => {
            mutationToast.showError("forms.member.unassign_groups.error");
          },
        },
      );
    },
    [member, removeGroupsFromMember, mutationToast],
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
          label="screens.iam.groups.search.label"
          placeholder="screens.iam.groups.search.placeholder"
        />
      </Host>

      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          menuOptions={{
            items: [
              {
                action: () => onRemoveGroup(group),
                label: "screens.members.detail.unassign",
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
