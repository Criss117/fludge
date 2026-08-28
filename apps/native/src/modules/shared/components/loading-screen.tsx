import { useThemeColor } from "heroui-native";
import { Typography } from "heroui-native/text";
import { useEffect } from "react";
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

type LoadingScreenProps = {
  /** Texto principal (título/logo). Por defecto: "Fludge" */
  title?: string;
  /** Mensaje secundario debajo del título */
  message?: string;
};

export function LoadingScreen({
  title = "Fludge",
  message = "Preparando todo para ti...",
}: LoadingScreenProps) {
  const accent = useThemeColor("accent");

  const opacity = useSharedValue(0);
  const entryScale = useSharedValue(0.92);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Entrada: fade + scale
    opacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    entryScale.value = withSpring(1, { damping: 8, stiffness: 90 });

    // Pulso continuo del logo (empieza tras la entrada)
    pulse.value = withSequence(
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
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: entryScale.value * pulse.value }],
  }));

  return (
    <View className="bg-background flex-1 items-center justify-center gap-6 px-6">
      <Animated.View style={logoStyle} className="items-center gap-2">
        <Typography className="text-accent text-5xl font-bold">
          {title}
        </Typography>
        {message ? (
          <Typography className="text-muted-foreground text-center text-sm">
            {message}
          </Typography>
        ) : null}
      </Animated.View>

      <ActivityIndicator color={accent} size="small" />
    </View>
  );
}
