import { MemberScreen } from "@/modules/iam/organizations/presentation/screens/member.screen";
import { useFindMemberDetail } from "@fludge/client/application/iam/queries/use-find-members";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";

function Screen({ memberid }: { memberid: string }) {
  const { data: member } = useFindMemberDetail(memberid);

  if (!member) return <Redirect href="/(private)/dashboard/(tabs)/iam" />;

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

export default function Member() {
  const { memberid } = useLocalSearchParams<{
    memberid?: string;
  }>();

  if (!memberid) return null;

  return <Screen memberid={memberid} />;
}
