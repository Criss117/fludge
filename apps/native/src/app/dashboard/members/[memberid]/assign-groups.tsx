import { AssignGroupsScreen } from "@/core/iam/screens/members/assign-groups.screen";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { useFindMemberDetail } from "@fludge/client/iam/queries/use-find-members";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";

function Screen({ memberid }: { memberid: string }) {
  const { data } = useFindMemberDetail(memberid);

  if (!data) return <Redirect href="/dashboard/iam" />;

  return <AssignGroupsScreen member={data} />;
}

export default function AssingGroups() {
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
