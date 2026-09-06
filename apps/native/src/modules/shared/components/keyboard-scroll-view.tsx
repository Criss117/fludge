import { ScrollView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useKeyboardGradualHeight } from "../hooks/use-keyboard-gradual-height";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { ScrollViewProps } from "react-native";
import type { BottomSheetScrollViewProps } from "@expo/ui/community/bottom-sheet";

interface Props extends ScrollViewProps {
  children: React.ReactNode;
  paddingBottom?: number;
}

export function KeyboardScrollView({
  children,
  paddingBottom = 20,
  ...scrollViewProps
}: Props) {
  const { height } = useKeyboardGradualHeight(paddingBottom);

  const fakeView = useAnimatedStyle(() => {
    const h = height.get();

    return {
      height: Math.abs(h),
      marginBottom: h > 0 ? 0 : paddingBottom,
    };
  });

  return (
    <ScrollView {...scrollViewProps}>
      {children}
      <Animated.View style={fakeView} />
    </ScrollView>
  );
}

export function KeyboardBottomSheetScrollView({
  children,
  paddingBottom = 20,
  showFakeView,
  ...scrollViewProps
}: BottomSheetScrollViewProps & {
  children: React.ReactNode;
  paddingBottom?: number;
  showFakeView?: boolean;
}) {
  const { height } = useKeyboardGradualHeight(paddingBottom);

  const fakeView = useAnimatedStyle(() => {
    const h = height.get();

    return {
      height: Math.abs(h),
      marginBottom: h > 0 ? 0 : paddingBottom,
      backgroundColor: showFakeView ? "red" : "transparent",
    };
  });

  return (
    <BottomSheetScrollView {...scrollViewProps}>
      {children}
      <Animated.View style={fakeView} />
    </BottomSheetScrollView>
  );
}
