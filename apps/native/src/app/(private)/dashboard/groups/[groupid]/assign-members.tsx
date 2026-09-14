import { AssignMembersToGroup } from "@/modules/iam/organizations/presentation/screens/assign-members-to-group.screen";
import { useFindGroupDetail } from "@fludge/client/application/iam/queries/use-find-groups";
import { Redirect, useLocalSearchParams } from "expo-router";

function Screen({ groupid }: { groupid: string }) {
  const { data: group } = useFindGroupDetail(groupid);

  if (!group) return <Redirect href="/(private)/dashboard/(tabs)/iam" />;

  return <AssignMembersToGroup group={group} />;
}

export default function AssignMembers() {
  const { groupid } = useLocalSearchParams<{ groupid: string }>();

  if (!groupid) return null;

  return <Screen groupid={groupid} />;
}
