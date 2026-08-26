import { Suspense } from "react";

import {
  SelectOrganizationScreen,
  SelectOrganizationScreenSkeleton,
} from "@/modules/iam/organizations/presentation/screens/select-organization.screen";

export default function SelectOrgnization() {
  return (
    <Suspense fallback={<SelectOrganizationScreenSkeleton />}>
      <SelectOrganizationScreen />
    </Suspense>
  );
}
