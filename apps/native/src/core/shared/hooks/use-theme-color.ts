import type { Theme } from "expo-router";
import { DarkTheme, DefaultTheme } from "expo-router";
import { useMemo } from "react";
import { useColorScheme } from "react-native";

import { APP_COLORS } from "@/lib/theme";

export function useThemeColor() {
  const scheme = useColorScheme();

  const theme = scheme === null ? "light" : scheme;

  return APP_COLORS[theme];
}

export function useNavigationTheme(): Theme {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = APP_COLORS[scheme];
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;

  return useMemo(
    () => ({
      ...base, // conserva `dark` y `fonts`
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.onSurface,
        border: colors.outline,
      },
    }),
    [base, colors],
  );
}
