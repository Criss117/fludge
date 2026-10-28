import type { SyncData } from "@fludge/client/sync/use-sync-catalog";
import type { UseSuspenseQueryResult } from "@tanstack/react-query";

import type { iconName } from "@/core/shared/components/icon";

export interface SyncItemProps {
  syncHook: UseSuspenseQueryResult<SyncData, Error>;
  module: "iam" | "catalog" | "commerce";
  icon: iconName;
}
