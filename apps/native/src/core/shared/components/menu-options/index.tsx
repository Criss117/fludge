import { DropdownMenu, DropdownMenuItem, IconButton } from "@expo/ui/jetpack-compose";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

import type { MenuOptionsProps } from "./types";

export function MenuOptions({ items, isExpanded, onExpandChange }: MenuOptionsProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  const open = () => onExpandChange(true);
  const close = () => onExpandChange(false);

  return (
    <DropdownMenu expanded={isExpanded} onDismissRequest={close} color={colors.primaryContainer}>
      <DropdownMenu.Trigger>
        <IconButton onClick={open}>
          <Icon name="more-vert" size={24} color={colors.onSecondaryContainer} />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Items>
        {items.map((i, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => {
              close();
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
              <ThemedNativeText color={i.color ? colors[i.color] : colors.onSecondaryContainer}>
                {t(i.label)}
              </ThemedNativeText>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenu.Items>
    </DropdownMenu>
  );
}
