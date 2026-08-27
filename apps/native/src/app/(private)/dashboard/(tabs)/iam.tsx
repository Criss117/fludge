import {
  IamScreen,
  IamScreenSkeleton,
} from "@/modules/iam/organizations/presentation/screens/iam.screen";
import { Suspense } from "react";

export default function DashboardIam() {
  return (
    <Suspense fallback={<IamScreenSkeleton />}>
      <IamScreen />
    </Suspense>
  );
}
