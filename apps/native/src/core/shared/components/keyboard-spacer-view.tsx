import Animated from "react-native-reanimated";

import { useKeyboardSpacer } from "../hooks/use-keyboard-spacer";
import { useThemeColor } from "../hooks/use-theme-color";

interface Props {
  show?: boolean;
}

export function KeyboardSpacerView({ show }: Props) {
  const { animatedStyle } = useKeyboardSpacer();
  const colors = useThemeColor();

  return (
    <Animated.View
      style={{ ...animatedStyle, backgroundColor: show ? colors.error : "transparent" }}
    />
  );
}
