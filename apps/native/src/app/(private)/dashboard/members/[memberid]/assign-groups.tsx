import { AssignGroupsToMember } from "@/modules/iam/organizations/presentation/screens/assign-groups-to-member.screen";
import { useLocalSearchParams } from "expo-router";

export default function AssignGroups() {
  const { memberid } = useLocalSearchParams<{
    memberid?: string;
  }>();

  if (!memberid) return null;

  return <AssignGroupsToMember memberId={memberid} />;
}
