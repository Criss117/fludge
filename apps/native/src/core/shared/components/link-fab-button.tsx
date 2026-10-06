import { SPACING } from "@/lib/sp";
import { FloatingActionButton, Host } from "@expo/ui/jetpack-compose";
import { type Href, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { useKeyboardSpacer } from "../hooks/use-keyboard-spacer";
import { useThemeColor } from "../hooks/use-theme-color";
import { Icon } from "./icon";

interface Props {
  action:
    | {
        href: Href;
        type: "push" | "replace";
      }
    | {
        type: "back";
      };
}

export function LinkFabButton({ action }: Props) {
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
