import { useColorScheme } from "react-native";

import { APP_COLORS } from "@/lib/theme";

export function useThemeColor() {
  const scheme = useColorScheme();

  const theme = scheme === null ? "light" : scheme;

  return APP_COLORS[theme];
}
