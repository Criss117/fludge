import { Button, Popover, VStack } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  frame,
  labelStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";

import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import { Icon } from "../icon";
import { ThemedNativeText } from "../themed-text";
import type { MenuOptionsProps } from "./types";

const width = Dimensions.get("window").width;

export function MenuOptions({ items, isExpanded, onExpandChange }: MenuOptionsProps) {
  const { t } = useTranslation();
  const colors = useThemeColor();
  const [internalExpanded, setInternalExpanded] = useState(false);

  const expanded = isExpanded ?? internalExpanded;
  const setExpanded = onExpandChange ?? setInternalExpanded;

  const open = () => setExpanded(true);
  const close = () => setExpanded(false);

  return (
    <Popover
      isPresented={expanded}
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
        <VStack
          modifiers={[
            frame({
              width: Math.floor(width / 3),
            }),
            padding({ all: SPACING.md }),
          ]}
          spacing={SPACING.md}
        >
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
                size={18}
                color={i.color ? colors[i.color] : colors.onSecondaryContainer}
              />
              <ThemedNativeText
                color={i.color ? colors[i.color] : colors.onSecondaryContainer}
                modifiers={[
                  frame({
                    width: Infinity,
                  }),
                ]}
              >
                {t(i.label)}
              </ThemedNativeText>
            </Button>
          ))}
        </VStack>
      </Popover.Content>
    </Popover>
  );
}
