// remount-boundary.tsx

import { useRemountEpoch } from "@fludge/client/shared/use-remount-epoch";
import React from "react";

export function RemountBoundary({ children }: { children: React.ReactNode }) {
  const epoch = useRemountEpoch();
  return <React.Fragment key={epoch}>{children}</React.Fragment>;
}
