import Animated from "react-native-reanimated";

import { useKeyboardSpacer } from "../hooks/use-keyboard-spacer";

interface Props {
  show?: boolean;
}

export function KeyboardSpacerView({ show }: Props) {
  const height = useKeyboardSpacer();

  return <Animated.View style={{ ...height, backgroundColor: show ? "#000000" : "transparent" }} />;
}
