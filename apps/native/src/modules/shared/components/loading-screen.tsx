import type { TranslationKey } from "@fludge/i18n/index";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
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
import { Text } from "./app-text";

type LoadingScreenProps = {
  message?: TranslationKey;
};

export function LoadingScreen({ message }: LoadingScreenProps) {
  const { t } = useTranslation();
  const accent = useCSSVariable("accent");

  const opacity = useSharedValue(0);
  const entryScale = useSharedValue(0.92);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Entrada: fade + scale
    opacity.set(
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
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
            withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        )
      )
    );
  }, [entryScale, opacity, pulse]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ scale: entryScale.get() * pulse.get() }],
  }));

  return (
    <View className="bg-background flex-1 items-center justify-center gap-6 px-6">
      <Animated.View style={logoStyle} className="items-center gap-2">
        <Text className="text-accent text-5xl font-bold">{t("app.title")}</Text>
        {message ? (
          <Text className="text-muted text-center text-sm">{t(message)}</Text>
        ) : null}
      </Animated.View>

      <ActivityIndicator color={accent?.toString()} size="small" />
    </View>
  );
}
