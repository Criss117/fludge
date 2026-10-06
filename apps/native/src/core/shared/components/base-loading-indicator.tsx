import { StyleSheet, View } from "react-native";
import { useThemeColor } from "../hooks/use-theme-color";
import { Host, LoadingIndicator } from "@expo/ui/jetpack-compose";
import { SPACING } from "@/lib/sp";

export function BaseLoadingIndicator() {
  const colors = useThemeColor();

  return (
    <View style={styles.container}>
      <Host matchContents>
        <LoadingIndicator color={colors.primary} />
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: SPACING.md,
  },
});
