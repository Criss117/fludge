import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";

export function useKeyboardGradualHeight(value: number) {
  const height = useSharedValue(value);

  useKeyboardHandler({
    onMove: (e) => {
      "worklet";

      height.value = Math.max(e.height, value);
    },
    onEnd: (e) => {
      "worklet";

      height.value = e.height;
    },
  });

  return { height };
}
