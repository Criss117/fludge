import { Button, Popover, VStack } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  labelStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useTranslation } from "react-i18next";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { Icon } from "../icon";
import { ThemedNativeText } from "../themed-text";
import type { MenuOptionsProps } from "./types";

export function MenuOptions({ items, isExpanded, onExpandChange }: MenuOptionsProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();

  const open = () => onExpandChange(true);
  const close = () => onExpandChange(false);

  return (
    <Popover
      isPresented={isExpanded}
      onIsPresentedChange={(v) => {
        if (v) {
          open();
        } else {
          close();
        }
      }}
      arrowEdge="top"
    >
      <Popover.Trigger>
        <Button
          onPress={open}
          modifiers={[
            buttonStyle("borderless"),
            controlSize("large"),
            labelStyle("iconOnly"),
            buttonBorderShape("circle"),
          ]}
        >
          <Icon name="more-vert" size={24} color={colors.onSecondaryContainer} />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <VStack modifiers={[padding({ all: SPACING.md })]}>
          {items.map((i, index) => (
            <Button
              key={index}
              onPress={() => {
                close();
                i.action();
              }}
            >
              <Icon
                name={i.icon}
                size={24}
                color={i.color ? colors[i.color] : colors.onSecondaryContainer}
              />
              <ThemedNativeText color={i.color ? colors[i.color] : colors.onSecondaryContainer}>
                {t(i.label)}
              </ThemedNativeText>
            </Button>
          ))}
        </VStack>
      </Popover.Content>
    </Popover>
  );
}
