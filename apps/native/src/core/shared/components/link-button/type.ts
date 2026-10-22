import type { ButtonProps } from "@expo/ui/jetpack-compose";
import type { ModifierConfig } from "@expo/ui/swift-ui/modifiers";
import type { Href } from "expo-router";

export interface LinkButtonProps {
  onClick?: () => void;
  colors?: ButtonProps["colors"];
  modifiers?: ButtonProps["modifiers"] | ModifierConfig[];
  children?: React.ReactElement | React.ReactElement[];
  action:
    | {
        href: Href;
        type: "push" | "replace";
      }
    | {
        type: "back";
      };
}
