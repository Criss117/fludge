import {
  GroupsScreen,
  GroupsScreenSkeleton,
} from "@/modules/iam/organizations/presentation/screens/groups.screen";
import { Suspense } from "react";

export default function IamGroups() {
  return (
    <Suspense fallback={<GroupsScreenSkeleton />}>
      <GroupsScreen />
    </Suspense>
  );
}
