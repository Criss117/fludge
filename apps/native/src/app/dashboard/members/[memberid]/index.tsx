import { MemberDetailScreen } from "@/core/iam/screens/member-detail";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { useFindMemberDetail } from "@fludge/client/iam/queries/use-find-members";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";

function Screen({ memberid }: { memberid: string }) {
  const { data } = useFindMemberDetail(memberid);

  if (!data) return <Redirect href="/dashboard/iam" />;

  return (
    <>
      <Stack.Screen
        options={{
          title: data.user.name,
        }}
      />
      <MemberDetailScreen member={data} />
    </>
  );
}

export default function MemberDetails() {
  const { memberid } = useLocalSearchParams<{
    memberid?: string;
  }>();

  if (!memberid) return null;

  return (
    <Suspense fallback={<BaseLoadingIndicator />}>
      <Screen memberid={memberid} />
    </Suspense>
  );
}
