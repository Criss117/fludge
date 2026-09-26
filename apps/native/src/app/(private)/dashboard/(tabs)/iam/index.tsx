import {
  MembersScreen,
  MembersScreenSkeleton,
} from "@/modules/iam/presentation/screens/members.screen";
import { Suspense } from "react";

export default function IamMembers() {
  return (
    <Suspense fallback={<MembersScreenSkeleton />}>
      <MembersScreen />
    </Suspense>
  );
}
