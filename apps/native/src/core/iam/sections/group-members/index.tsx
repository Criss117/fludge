import { TextInput } from "@/core/shared/components/text-input";
import { useToast } from "@/core/shared/components/toast-provider";
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

interface Props {
  group: GroupDetail;
}

export function GroupMembersSection({ group }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const removeMembersFromGroup = useRemoveMembersFromGroup();
  const toast = useToast();

  const members = useMemo(() => {
    return group.members.filter((m) =>
      m.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [group, searchQuery]);

  const onRemoveMember = useCallback(
    (member: MemberSummary) => {
      removeMembersFromGroup.mutate(
        {
          groupId: group.id,
          memberIds: [member.id],
        },
        {
          onSuccess: () => {
            toast.show({
              message: "forms.member.success.unassign_groups",
              duration: "short",
            });
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
