import type { GroupSummary } from "@fludge/client/iam/domain/entities";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

import type { MenuOptionItem } from "@/core/shared/components/menu-options";

import type { MenuOptionsType } from "./index";

interface Props {
  group: GroupSummary;
  menuOptions?: MenuOptionsType;
}

export function useGroupCard({ group, menuOptions }: Props) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const items = useMemo(() => {
    const baseItems: MenuOptionItem[] = [
      {
        label: "helpers.navigation.see_details",
        action: () => {
          router.push({
            pathname: "/dashboard/groups/[groupid]",
            params: { groupid: group.id },
          });
        },
        icon: "visibility",
      },
      {
        label: "helpers.navigation.update",
        action: () => {
          router.push({
            pathname: "/dashboard/groups/[groupid]/update",
            params: { groupid: group.id },
          });
        },
        icon: "edit",
      },
      ...(menuOptions?.items ?? []),
    ];

    return baseItems;
  }, [menuOptions, router, group.id]);

  return {
    state: {
      isExpanded,
      menuOptions: items,
      hasMenu: !menuOptions?.hide,
    },
    actions: {
      setIsExpanded,
    },
  };
}
