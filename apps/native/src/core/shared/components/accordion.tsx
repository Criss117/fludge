import { SPACING } from "@/lib/sp";
import { Column, ElevatedCard, Row } from "@expo/ui/jetpack-compose";
import {
  animateContentSize,
  animated,
  clickable,
  fillMaxWidth,
  graphicsLayer,
  padding,
  paddingAll,
  tween,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
import { useThemeColor } from "../hooks/use-theme-color";
import { ThemedNativeText } from "./themed-text";
import { Icon } from "./icon";

type Props = {
  label: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export function Accordion({
  label,
  children,
  defaultOpen,
  onOpenChange,
}: Props) {
  const colors = useThemeColor();
  const [open, setOpen] = useState(defaultOpen);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  };

  return (
    <ElevatedCard
      colors={{
        containerColor: colors.onSecondary,
      }}
      modifiers={[fillMaxWidth(), animateContentSize()]}
    >
      <Row
        verticalAlignment="center"
        modifiers={[fillMaxWidth(), clickable(toggle), paddingAll(SPACING.md)]}
      >
        <ThemedNativeText color={colors.secondary} modifiers={[weight(1)]}>
          {label}
        </ThemedNativeText>
        <Icon
          name="arrow-drop-down"
          modifiers={[
            graphicsLayer({
              rotationZ: animated(
                open ? 180 : 0,
                tween({ durationMillis: 250, easing: "fastOutSlowIn" }),
              ),
            }),
          ]}
        />
      </Row>

      {open && (
        <Column
          modifiers={[
            fillMaxWidth(),
            padding(SPACING.md, 0, SPACING.md, SPACING.md),
          ]}
        >
          {children}
        </Column>
      )}
    </ElevatedCard>
  );
}
