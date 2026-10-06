import { type ScrollViewProps, View, type ViewProps } from "react-native";

import { ScrollView } from "react-native-gesture-handler";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";

export function ThemedView({ style, ...otherProps }: ViewProps) {
  const colors = useThemeColor();

  return (
    <View
      style={[{ backgroundColor: colors.background }, style]}
      {...otherProps}
    />
  );
}

export function ThemedScrollView({ style, ...otherProps }: ScrollViewProps) {
  const colors = useThemeColor();

  return (
    <ScrollView
      style={[{ backgroundColor: colors.background }, style]}
      {...otherProps}
    />
  );
}
