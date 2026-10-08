import { SPACING } from "@/lib/sp";
import type {
  GroupSummary,
  MemberDetail,
} from "@fludge/client/iam/domain/entities";
import { StyleSheet, View } from "react-native";
import { GroupCard, type MenuOptions } from "@/core/iam/components/group-card";
import { TextInput } from "@/core/shared/components/text-input";
import { Host } from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { useCallback, useMemo, useState } from "react";
import { useRemoveGroupsFromMember } from "@fludge/client/iam/mutations/use-member.mutations";
import { useToast } from "@/core/shared/components/toast-provider";

interface Props {
  member: MemberDetail;
}

export function MemberGroupsSection({ member }: Props) {
  const removeGroupsFromMember = useRemoveGroupsFromMember();
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  const groups = useMemo(() => {
    return member.groups.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [member, searchQuery]);

  const onRemoveGroup = useCallback(
    (group: GroupSummary) => {
      removeGroupsFromMember.mutate(
        {
          memberId: member.id,
          groupIds: [group.id],
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
    [member],
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
