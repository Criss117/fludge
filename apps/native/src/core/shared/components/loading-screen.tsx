import type { TranslationKey } from "@fludge/i18n/index";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useCSSVariable } from "uniwind";
import { ThemedText } from "./themed-text";

// TODO: reemplazar por los tokens reales de tu tema (mismos que en
// FatalErrorScreen). Sustituyen a bg-background y text-muted.
const colors = {
  background: "#ffffff",
  muted: "#6b7280",
};

type LoadingScreenProps = {
  message?: TranslationKey;
};

export function LoadingScreen({ message }: LoadingScreenProps) {
  const { t } = useTranslation();
  const accent = useCSSVariable("accent");
  const isDark = useColorScheme() === "dark";

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
    <View style={styles.container}>
      <Animated.View style={[styles.logo, logoStyle]}>
        <ThemedText
          style={[styles.title, isDark && { color: accent?.toString() }]}
        >
          {t("app.title")}
        </ThemedText>
        {message ? (
          <ThemedText style={styles.message}>{t(message)}</ThemedText>
        ) : null}
      </Animated.View>

      <ActivityIndicator color={accent?.toString()} size="small" />
    </View>
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
    backgroundColor: colors.background,
  },
  // items-center gap-2
  logo: {
    alignItems: "center",
    gap: 8,
  },
  // text-5xl font-bold (+ dark:text-accent aplicado inline según el esquema)
  title: {
    fontSize: 48,
    lineHeight: 48,
    fontWeight: "700",
  },
  // text-muted text-center text-sm
  message: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});
