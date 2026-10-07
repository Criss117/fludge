import { Icon, type IconName } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import type { Colors } from "@/lib/theme";
import {
  DropdownMenu,
  DropdownMenuItem,
  IconButton,
} from "@expo/ui/jetpack-compose";
import type { GroupSummary } from "@fludge/client/iam/domain/entities";
import type { TranslationKey } from "@fludge/i18n/index";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export type GroupCardMenuItems = {
  hide: ("update" | "see_details")[];
  extends?: {
    label: TranslationKey;
    action: (group: GroupSummary) => void;
    icon: IconName;
    color?: keyof Colors;
  }[];
};

interface Props {
  group: GroupSummary;
  items?: GroupCardMenuItems;
}

export function GroupCardOptions({ group, items }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const colors = useThemeColor();
  const router = useRouter();

  return (
    <DropdownMenu
      expanded={isExpanded}
      onDismissRequest={() => setIsExpanded(false)}
      color={colors.primaryContainer}
    >
      <DropdownMenu.Trigger>
        <IconButton onClick={() => setIsExpanded(true)}>
          <Icon
            name="more-vert"
            size={24}
            color={colors.onSecondaryContainer}
          />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Items>
        {!items?.hide.includes("see_details") && (
          <DropdownMenuItem
            onClick={() => {
              setIsExpanded(false);
              router.push({
                pathname: "/dashboard/groups/[groupid]",
                params: { groupid: group.id },
              });
            }}
          >
            <DropdownMenuItem.LeadingIcon>
              <Icon
                name="visibility"
                size={24}
                color={colors.onSecondaryContainer}
              />
            </DropdownMenuItem.LeadingIcon>
            <DropdownMenuItem.Text>
              <ThemedNativeText color={colors.onSecondaryContainer}>
                {t("helpers.navigation.see_details")}
              </ThemedNativeText>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        )}
        {!items?.hide.includes("update") && (
          <DropdownMenuItem
            onClick={() => {
              setIsExpanded(false);
              router.push({
                pathname: "/dashboard/groups/[groupid]/update",
                params: { groupid: group.id },
              });
            }}
          >
            <DropdownMenuItem.LeadingIcon>
              <Icon name="edit" size={24} color={colors.onSecondaryContainer} />
            </DropdownMenuItem.LeadingIcon>
            <DropdownMenuItem.Text>
              <ThemedNativeText color={colors.onSecondaryContainer}>
                {t("helpers.navigation.update")}
              </ThemedNativeText>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        )}

        {items?.extends?.map((i, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => {
              setIsExpanded(false);
              i.action(group);
            }}
          >
            <DropdownMenuItem.LeadingIcon>
              <Icon
                name={i.icon}
                size={24}
                color={i.color ? colors[i.color] : colors.onSecondaryContainer}
              />
            </DropdownMenuItem.LeadingIcon>
            <DropdownMenuItem.Text>
              <ThemedNativeText
                color={i.color ? colors[i.color] : colors.onSecondaryContainer}
              >
                {t(i.label)}
              </ThemedNativeText>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenu.Items>
    </DropdownMenu>
  );
}
