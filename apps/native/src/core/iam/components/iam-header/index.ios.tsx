import { Button, Host } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  labelStyle,
} from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/core/shared/components/themed-text";
import { SPACING } from "@/lib/sp";

import type { IamHeaderProps } from "./type";

export function IamHeader({ title }: IamHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // return null;

  return (
    <View style={styles.container}>
      <ThemedText variant="h4">{t(title)}</ThemedText>

      <View>
        <Host matchContents>
          <Button
            onPress={() => router.push("/dashboard/settings")}
            label="Settings"
            systemImage="gear"
            modifiers={[
              buttonStyle("glass"),
              controlSize("extraLarge"),
              labelStyle("iconOnly"),
              buttonBorderShape("circle"),
            ]}
          />
        </Host>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SPACING["3xl"],
    paddingHorizontal: SPACING.md,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
});
