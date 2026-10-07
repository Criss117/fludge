import { UpdateGroupScreen } from "@/core/iam/screens/update-group";
import { BaseLoadingIndicator } from "@/core/shared/components/base-loading-indicator";
import { useFindGroupDetail } from "@fludge/client/iam/queries/use-find-groups";
import { Redirect, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";

function Screen({ groupid }: { groupid: string }) {
  const { data } = useFindGroupDetail(groupid);

  if (!data) return <Redirect href="/dashboard/iam/groups" />;

  return <UpdateGroupScreen group={data} />;
}

export default function UpdateGroup() {
  const { groupid } = useLocalSearchParams<{
    groupid?: string;
  }>();

  if (!groupid) return null;

  return (
    <Suspense fallback={<BaseLoadingIndicator />}>
      <Screen groupid={groupid} />
    </Suspense>
  );
}
