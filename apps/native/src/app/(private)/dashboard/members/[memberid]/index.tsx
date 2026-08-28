import { MemberScreen } from "@/modules/iam/organizations/presentation/screens/member.screen";
import { useFindMember } from "@fludge/client/application/iam/organization/queries/use-find-members";
import { Stack, useLocalSearchParams } from "expo-router";

export default function Member() {
  const { memberid } = useLocalSearchParams<{
    memberid: string;
  }>();
  const member = useFindMember(memberid);

  return (
    <>
      <Stack.Screen
        options={{
          title: member.user.name,
        }}
      />
      <MemberScreen member={member} />
    </>
  );
}
