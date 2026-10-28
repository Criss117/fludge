import { ago } from "@fludge/client/shared/date";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { MenuOptionItem } from "@/core/shared/components/menu-options/types";

import type { MemberCardProps } from "./types";

export function useMemberCard(props: MemberCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const items = useMemo(() => {
    const baseItems: MenuOptionItem[] = [
      {
        label: "helpers.navigation.see_details",
        action: () => {
          router.push({
            pathname: "/dashboard/members/[memberid]",
            params: { memberid: props.member.id },
          });
        },
        icon: "eye",
      },
      ...(props.menuOptions?.items ?? []),
    ];

    return baseItems;
  }, [props.menuOptions, router, props.member.id]);

  const onLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(true);
  };

  return {
    texts: {
      createdAt: t("helpers.date.created_at", {
        date: ago(props.member.createdAt, new Date(), { dateAfter24h: true }),
      }),

      lastUpdated: t("helpers.date.last_updated", {
        date: ago(props.member.updatedAt, new Date(), { dateAfter24h: true }),
      }),
    },
    state: {
      menuOptions: items,
      isExpanded,
    },
    actions: {
      setIsExpanded,

      onLongPress,
    },
  };
}
