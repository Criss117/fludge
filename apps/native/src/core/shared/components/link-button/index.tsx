import { Button } from "@expo/ui/jetpack-compose";
import { useRouter } from "expo-router";

import type { LinkButtonProps } from "./type";

export function LinkButton({ children, action, colors, modifiers, onClick }: LinkButtonProps) {
  const router = useRouter();

  const hanldeOnClick = () => {
    switch (action.type) {
      case "back": {
        router.back();
        break;
      }
      case "push": {
        router.push(action.href);
        break;
      }
      case "replace": {
        router.replace(action.href);
        break;
      }
    }
  };

  return (
    <Button
      colors={colors}
      modifiers={modifiers}
      onClick={() => {
        hanldeOnClick();
        onClick?.();
      }}
    >
      {children}
    </Button>
  );
}
