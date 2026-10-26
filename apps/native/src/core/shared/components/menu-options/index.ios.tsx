import { Button, HStack, Menu, Spacer } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  frame,
  labelStyle,
} from "@expo/ui/swift-ui/modifiers";
import { useTranslation } from "react-i18next";

import { Icon } from "@/core/shared/components/icon";
import { ThemedNativeText } from "@/core/shared/components/themed-text";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { MenuOptionsProps } from "./types";

export function MenuOptions({ items }: MenuOptionsProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  return (
    <Menu
      label={
        <Button
          modifiers={[
            buttonStyle("bordered"),
            controlSize("large"),
            labelStyle("iconOnly"),
            buttonBorderShape("circle"),
          ]}
        >
          <Icon name="more-vert" size={24} color={colors.onSecondaryContainer} />
        </Button>
      }
      systemImage="ellipsis.circle"
    >
      {items.map((i, index) => (
        <Button
          key={index}
          onPress={() => {
            i.action();
          }}
        >
          <HStack
            spacing={SPACING.sm}
            modifiers={[frame({ maxWidth: Infinity, alignment: "leading" })]}
          >
            <Icon
              name={i.icon}
              size={18}
              color={i.color ? colors[i.color] : colors.onSecondaryContainer}
            />
            <ThemedNativeText color={i.color ? colors[i.color] : colors.onSecondaryContainer}>
              {t(i.label)}
            </ThemedNativeText>
            <Spacer />
          </HStack>
        </Button>
      ))}
    </Menu>
  );
}
