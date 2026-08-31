import { AssignMembersToGroup } from "@/modules/iam/organizations/presentation/screens/assign-members-to-group.screen";
import { useLocalSearchParams } from "expo-router";

export default function AssignMembers() {
  const { groupid } = useLocalSearchParams<{ groupid: string }>();

  if (!groupid) return null;

  return <AssignMembersToGroup groupId={groupid} />;
}
