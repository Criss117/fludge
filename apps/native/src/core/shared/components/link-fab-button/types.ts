import type { Href } from "expo-router";

export interface LinkFabButtonProps {
  action:
    | {
        href: Href;
        type: "push" | "replace";
      }
    | {
        type: "back";
      };
}
