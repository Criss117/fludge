import {
  GroupScreen,
  GroupScreenSkeleton,
} from "@/modules/iam/organizations/presentation/screens/group.screen";
import { useFindGroup } from "@fludge/client/application/iam/organization/queries/use-find-groups";
import { Stack, useLocalSearchParams } from "expo-router";
import { Suspense } from "react";

export default function Group() {
  const { groupid } = useLocalSearchParams<{ groupid: string }>();
  const { data: group } = useFindGroup(groupid);

  return (
    <>
      <Stack.Screen options={{ title: group.name }} />
      <Suspense fallback={<GroupScreenSkeleton />}>
        <GroupScreen group={group} />
      </Suspense>
    </>
  );
}
