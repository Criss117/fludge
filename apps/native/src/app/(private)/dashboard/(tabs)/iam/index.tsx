import {
  MembersScreen,
  MembersScreenSkeleton,
} from "@/modules/iam/organizations/presentation/screens/members.screen";
import { Suspense } from "react";

export default function IamMembers() {
  return (
    <Suspense fallback={<MembersScreenSkeleton />}>
      <MembersScreen />
    </Suspense>
  );
}
