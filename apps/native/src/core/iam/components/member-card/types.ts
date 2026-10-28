import type { MemberSummary } from "@fludge/client/iam/domain/entities";

import type { MenuOptionItem } from "@/core/shared/components/menu-options/types";

export type MemberCardMenuOptions = {
  hide?: boolean;
  items?: MenuOptionItem[];
};

export interface MemberCardProps {
  member: MemberSummary;
  menuOptions?: MemberCardMenuOptions;
}
