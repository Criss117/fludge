import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

// function logHeight(h: number) {
//   console.info(h);
// }

export function useKeyboardSpacer() {
  const height = useSharedValue(0);
  const maxHeight = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        height.set(e.height);
        // scheduleOnRN(logHeight, e.height);
      },
    },
    [],
  );

  const animatedStyle = useAnimatedStyle(() => ({ height: height.value }));

  return { animatedStyle, maxHeight };
}
