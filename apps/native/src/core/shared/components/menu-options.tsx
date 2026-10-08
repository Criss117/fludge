import { Icon, type IconName } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import type { Colors } from "@/lib/theme";
import {
  DropdownMenu,
  DropdownMenuItem,
  IconButton,
} from "@expo/ui/jetpack-compose";
import type { TranslationKey } from "@fludge/i18n/index";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export type MenuOptionItem = {
  label: TranslationKey;
  action: () => void;
  icon: IconName;
  color?: keyof Colors;
};

interface Props {
  items: MenuOptionItem[];
}

export function MenuOptions({ items }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const colors = useThemeColor();

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
        {items.map((i, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => {
              setIsExpanded(false);
              i.action();
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
