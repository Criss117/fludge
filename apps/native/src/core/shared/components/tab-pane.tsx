import { Activity, type ReactNode, useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type TabPaneProps = {
  name: string;
  active: boolean;
  children: ReactNode;
};

export function TabPane({ name, active, children }: TabPaneProps) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 250 });
  }, [active, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <Activity name={name} mode={active ? "visible" : "hidden"}>
      <Animated.View style={[styles.pane, style]} pointerEvents={active ? "auto" : "none"}>
        {children}
      </Animated.View>
    </Activity>
  );
}

const styles = StyleSheet.create({
  pane: { flex: 1 },
});
