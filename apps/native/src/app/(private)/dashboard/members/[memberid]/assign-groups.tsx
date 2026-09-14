import { AssignGroupsToMember } from "@/modules/iam/organizations/presentation/screens/assign-groups-to-member.screen";
import { useFindMemberDetail } from "@fludge/client/application/iam/queries/use-find-members";
import { Redirect, useLocalSearchParams } from "expo-router";

function Screen({ memberid }: { memberid: string }) {
  const { data: member } = useFindMemberDetail(memberid);

  if (!member) return <Redirect href="/(private)/dashboard/(tabs)/iam" />;

  return <AssignGroupsToMember member={member} />;
}

export default function AssignGroups() {
  const { memberid } = useLocalSearchParams<{
    memberid?: string;
  }>();

  if (!memberid) return null;

  return <Screen memberid={memberid} />;
}
