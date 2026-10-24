import { Button, Host, HStack } from "@expo/ui/swift-ui";
import {
  Animation,
  animation,
  buttonBorderShape,
  buttonStyle,
  labelStyle,
  offset,
  opacity,
} from "@expo/ui/swift-ui/modifiers";
import { usePathname, useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/core/shared/components/themed-text";
import { SPACING } from "@/lib/sp";

import { Icon } from "../icon";
import type { HomeHeaderProps } from "./type";

export function HomeHeader({ title, navigateTo }: HomeHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const currentRoute = useMemo(() => {
    const routeName = pathname.split("/").pop();

    return navigateTo?.find((r) => r.key === routeName);
  }, [pathname, navigateTo]);

  // return null;
  const hasRoute = !!currentRoute;

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <ThemedText variant="h4">{t(title)}</ThemedText>
      </View>

      <View>
        <Host matchContents>
          <HStack
            modifiers={[animation(Animation.spring({ duration: 0.35, bounce: 0.1 }), hasRoute)]}
          >
            <Button
              onPress={() => currentRoute && router.push(currentRoute.href)}
              modifiers={[
                buttonStyle("glass"),
                labelStyle("iconOnly"),
                buttonBorderShape("circle"),
                opacity(hasRoute ? 1 : 0),
                offset({ x: hasRoute ? 0 : SPACING.xl }),
              ]}
            >
              <Icon name={currentRoute?.icon ?? "add"} size={24} />
            </Button>

            <Button
              onPress={() => router.push("/dashboard/settings")}
              modifiers={[
                buttonStyle("glass"),
                labelStyle("iconOnly"),
                buttonBorderShape("circle"),
              ]}
            >
              <Icon name="settings" size={21} />
            </Button>
          </HStack>
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
