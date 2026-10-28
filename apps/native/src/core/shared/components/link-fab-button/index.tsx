import { FloatingActionButton, Host } from "@expo/ui/jetpack-compose";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { Icon } from "@/core/shared/components/icon";
import { useKeyboardSpacer } from "@/core/shared/hooks/use-keyboard-spacer";
import { useThemeColor } from "@/core/shared/hooks/use-theme-color";
import { SPACING } from "@/lib/sp";

import type { LinkFabButtonProps } from "./types";

export function LinkFabButton({ action }: LinkFabButtonProps) {
  const spacer = useKeyboardSpacer();
  const colors = useThemeColor();
  const router = useRouter();

  const onClick = () => {
    switch (action.type) {
      case "back": {
        router.back();
        break;
      }
      case "push": {
        router.push(action.href);
        break;
      }
      case "replace": {
        router.replace(action.href);
        break;
      }
    }
  };

  return (
    <View style={styles.fab}>
      <Host matchContents>
        <FloatingActionButton containerColor={colors.primary} onClick={onClick}>
          <FloatingActionButton.Icon>
            <Icon name="add" size={SPACING.lg} color={colors.onPrimary} />
          </FloatingActionButton.Icon>
        </FloatingActionButton>
      </Host>
      <Animated.View style={spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: SPACING.md,
    bottom: SPACING.md,
  },
});
