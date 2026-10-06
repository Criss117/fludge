import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

export function useKeyboardSpacer() {
  const height = useSharedValue(0);
  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        height.value = e.height;
      },
    },
    [],
  );
  return useAnimatedStyle(() => ({ height: height.value }));
}
