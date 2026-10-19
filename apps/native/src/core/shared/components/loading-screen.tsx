import type { TranslationKey } from "@fludge/i18n/index";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, useColorScheme } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useThemeColor } from "../hooks/use-theme-color";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

type LoadingScreenProps = {
  message?: TranslationKey;
};

export function LoadingScreen({ message }: LoadingScreenProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === "dark";
  const colors = useThemeColor();

  const opacity = useSharedValue(0);
  const entryScale = useSharedValue(0.92);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Entrada: fade + scale
    opacity.set(
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      }),
    );
    entryScale.set(withSpring(1, { damping: 8, stiffness: 90 }));

    // Pulso continuo del logo (empieza tras la entrada)
    pulse.set(
      withSequence(
        withTiming(1, { duration: 500 }),
        withRepeat(
          withSequence(
            withTiming(1.04, {
              duration: 900,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false,
        ),
      ),
    );
  }, [entryScale, opacity, pulse]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ scale: entryScale.get() * pulse.get() }],
  }));

  return (
    <ThemedView style={[styles.container]}>
      <Animated.View style={[styles.logo, logoStyle]}>
        <ThemedText style={[isDark && { color: colors.onBackground }]} variant="h1">
          {t("app.title")}
        </ThemedText>
        {message ? <ThemedText variant="muted">{t(message)}</ThemedText> : null}
      </Animated.View>

      <ActivityIndicator color={colors.onBackground} size="small" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // bg-background flex-1 items-center justify-center gap-6 px-6
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingHorizontal: 24,
  },
  // items-center gap-2
  logo: {
    alignItems: "center",
    gap: 8,
  },
});
