import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import {
  DropdownMenu,
  DropdownMenuItem,
  IconButton,
} from "@expo/ui/jetpack-compose";
import type { GroupSummary } from "@fludge/client/iam/domain/entities";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  group: GroupSummary;
}

export function GroupCardOptions({ group }: Props) {
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
      </DropdownMenu.Items>
    </DropdownMenu>
  );
}
