import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { withUniwind } from "uniwind";

const StyleAnimatedView = withUniwind(Animated.View);

const DURATION = 200;

export function FadeContentContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StyleAnimatedView
      entering={FadeIn.duration(DURATION)}
      exiting={FadeOut.duration(DURATION)}
      className="flex-1 gap-6"
    >
      {children}
    </StyleAnimatedView>
  );
}
